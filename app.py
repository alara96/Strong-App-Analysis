import numpy as np
import pandas as pd
from shiny import App, Inputs, Outputs, Session, reactive, render, req, ui
from shinywidgets import output_widget, render_widget
from plotnine import ggplot, aes, geom_line, geom_point, scale_x_datetime, theme, element_text, labs

workout_data_og = pd.read_csv("data/strong.csv")[['Date','Exercise Name', 'Set Order', 'Weight', 'Reps']]
# Contains Dupes
exercises = workout_data_og['Exercise Name'].tolist()
exercises.sort()

best_pr = ui.HTML(
    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-award" viewBox="0 0 16 16"> <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702z"/><path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/></svg>'
)


app_ui = ui.page_fillable(
    ui.page_fixed(
        ui.panel_title(title="Analyze Your Strong App Data", window_title="Strong Data Analysis"),
    ),
    ui.layout_sidebar(
        ui.panel_sidebar(
            ui.input_file("file_input", "Upload Workout CSV File", accept=[".csv"], multiple=False),
            ui.output_ui("show_exercises"),
            ui.output_ui("count_sets_reps"),
            ui.input_radio_buttons("analysis", "Analysis Type:", {"1": "1 Rep Max Prediction of Selected Exercise", "2": "Workout Volume Compared to Average Workout Volume" }, selected="1"),
            ui.output_ui("time_period"),
        ),
        ui.panel_main(
            ui.page_navbar(
                ui.nav_panel("Analyze",
                    ui.output_ui("pr_text"),
                    ui.layout_column_wrap(
                        ui.value_box(
                            "",
                            ui.output_text("Bench_pr"),
                            showcase=best_pr,
                            theme="green",
                        ),
                        ui.value_box(
                            "",
                            ui.output_text("Deadlift_pr"),
                            showcase=best_pr,
                            theme="blue",
                        ),
                        ui.value_box(
                            "",
                            ui.output_text("Squat_pr"),
                            showcase=best_pr,
                            theme="red",
                        ),
                        fill=True,
                    ),
                    ui.output_ui("add_line"),
                    ui.output_ui("add_space"),
                    ui.output_ui("plot_title"),
                    ui.output_plot("plot_exercise"),
                    ui.output_ui("plot_stats"),
                    ui.output_ui("add_line2"),
                    ui.output_ui("add_space2"),
                    ui.output_ui("data_title"),
                    ui.output_data_frame("show_data"),
                ),
                ui.nav_panel("Purpose",
                    ui.markdown(
                        """
                        # Strong App Data Analysis

                        ### Overview
                        This app is designed to help you analyze your workout data from the Strong app. You can upload your workout data and analyze it in two ways:
                        - 1 Rep Max Prediction of Selected Exercise: This analysis will predict your 1 rep max for a selected exercise over a specified time period.
                        - Workout Volume Compared to Average Workout Volume: This analysis will compare your workout volume to the average workout volume over a specified time period.

                        You can also view your all-time personal bests for the Bench Press, Deadlift, and Squat exercises.
                        
                        ### Instructions
                        To get started, upload your workout data and select the analysis type and exercise you want to analyze.

                        ### Citations
                        ##### Workout Data 
                        - Collected by using [Strong App](https://www.strong.app/).

                        ##### 1 Rep Max Prediction Formula by Epley
                        - Epley, B. Poundage chart. In: Boyd Epley Workout. Lincoln, NE: Body Enterprises, 1985. p. 86.
                        
                        """
                    ),
                )
            ),
        )
    ),
)

def server(input, output, session):
    @reactive.calc
    def parse_data() -> pd.DataFrame:
        workout_file: list[FileInfo] | None = input.file_input()
        if workout_file is None:
            return workout_data_og
        workout_data = pd.read_csv(workout_file[0]["datapath"])[['Date','Exercise Name', 'Set Order', 'Weight', 'Reps']]
        exercises = workout_data['Exercise Name'].tolist()
        exercises.sort()
        return workout_data

    @reactive.calc
    def parse_exercise() -> pd.DataFrame:
        workout_data = parse_data()
        selected_exercise = workout_data[workout_data['Exercise Name'] == input.exercise()]
        return selected_exercise

    @render.data_frame
    @reactive.event(input.exercise,input.file_input, input.analysis, input.date_range)
    def show_data():
        if input.analysis() == "1":
            selected_exercise = parse_exercise().copy()
            selected_exercise['Date_dt'] = pd.to_datetime(selected_exercise['Date'])
            selected_exercise['Date_dt'] = selected_exercise['Date_dt'].dt.date
            # selected_exercise['Date_dt'] = selected_exercise['Date'].dt.date

            # Filter the data for the specified date range
            start_date, end_date = input.date_range()
            mask = (selected_exercise['Date_dt'] >= start_date) & (selected_exercise['Date_dt'] <= end_date)
            selected_exercise = selected_exercise.loc[mask]
            selected_exercise = selected_exercise[['Date','Set Order','Weight','Reps']]

            return render.DataGrid(selected_exercise, width="100%",height="100%", selection_mode="none",)

    @render.ui
    @reactive.event(input.exercise,input.file_input, input.analysis)
    def data_title():
        if input.analysis() == "1":
            return ui.markdown(f"<h2 style='text-align: center;'>{input.exercise()} Data</h2>")
    @render.ui
    def show_exercises():
        exercises_update = parse_data().copy()['Exercise Name'].tolist()
        exercises_update.sort()
        return ui.input_selectize("exercise","Exercise for 1 Rep Analysis", exercises_update, selected=f"{exercises_update[0]}"), #Make reactive

    @render.ui
    @reactive.event(input.exercise,input.file_input)
    def count_sets_reps():
        selected_exercise = parse_exercise()
        count_sets = len(selected_exercise)
        count_reps = selected_exercise['Reps'].sum()
        return ui.markdown(f"<p style='text-align: center;'>Total # of Sets {count_sets}, Total # of Reps {count_reps}</p>")

    @render.ui
    @reactive.event(input.exercise,input.file_input,input.analysis)
    def plot_title():
        if input.analysis() == "1":
            return ui.markdown(f"<h2 style='text-align: center;'>{input.exercise()} Predicted 1 Rep Max Over Time Period</h2>")
        else:
            return ui.markdown(f"<h2 style='text-align: center;'>Workout Volume Compared to Average Volume Over Time Period</h2>")

    @render.plot
    @reactive.event(input.exercise,input.file_input,input.analysis, input.date_range)
    def plot_exercise():
        if input.analysis() == "1":
            return plot_1_rep_max()
        else:
            return plot_workout_volume()
        
    @reactive.calc
    def plot_1_rep_max():
        selected_exercise = parse_exercise().copy()
        selected_exercise['Date'] = pd.to_datetime(selected_exercise['Date'])
        selected_exercise['Date_dt'] = selected_exercise['Date'].dt.date
        selected_exercise['1_Rep_Max'] = (selected_exercise['Weight'] * selected_exercise['Reps'] / 30) + selected_exercise['Weight']
        
        # Filter the data for the specified date range
        start_date, end_date = input.date_range()
        mask = (selected_exercise['Date_dt'] >= start_date) & (selected_exercise['Date_dt'] <= end_date)
        selected_exercise = selected_exercise.loc[mask]
        
        daily_max = selected_exercise.groupby('Date')['1_Rep_Max'].max().reset_index()
        
        plot = (ggplot(daily_max, aes(x='Date', y='1_Rep_Max')) 
            + geom_line()
            + geom_point(aes(size='1_Rep_Max'), alpha=0.6)
            + scale_x_datetime(date_breaks='1 month', date_labels='%b %Y')
            + theme(axis_text_x=element_text(angle=45)) 
            + labs(x='Date', y='1 Rep Max')
            )  
        return plot
    
    @reactive.calc
    def plot_workout_volume():
        workout_data = parse_data().copy()
        workout_data['Date'] = pd.to_datetime(workout_data['Date'])
        workout_data['Date_dt'] = workout_data['Date'].dt.date
        
        start_date, end_date = input.date_range()
        mask = (workout_data['Date_dt'] >= start_date) & (workout_data['Date_dt'] <= end_date)
        workout_data = workout_data.loc[mask]
        
        workout_data['Volume'] = workout_data['Weight'] * workout_data['Reps']
        daily_volume = workout_data.groupby('Date')['Volume'].sum().reset_index()
        daily_volume['Average_Volume'] = daily_volume['Volume'].mean()
        daily_volume['Color'] = np.where(daily_volume['Volume'] < daily_volume['Average_Volume'], 'Below Average', 'Above Average')
        
        plot = (ggplot(daily_volume, aes(x='Date', y='Volume')) 
            + geom_line()
            + geom_line(aes(y='Average_Volume'), color='teal', linetype='dashed')
            + geom_point(aes(size='Volume', color='Color'), alpha=0.6)
            + scale_x_datetime(date_breaks='1 month', date_labels='%b %Y')
            + theme(axis_text_x=element_text(angle=45)) 
            + labs(x='Date', y='Volume')
            )  
        return plot


    @render.text
    def Bench_pr():
        data = parse_data().copy()
        bench_max = data[data['Exercise Name'].str.contains('Bench Press')]['Weight'].max()
        return f"Bench: {bench_max:.2f} lbs"

    @render.text
    def Deadlift_pr():
        data = parse_data().copy()
        deadlift_max = data[data['Exercise Name'].str.contains('Deadlift')]['Weight'].max()
        return f"Deadlift: {deadlift_max:.2f} lbs"

    @render.text
    def Squat_pr():
        data = parse_data().copy()
        squat_max = data[data['Exercise Name'].str.contains('Squat')]['Weight'].max()
        return f"Squat: {squat_max:.2f} lbs"

    @render.ui
    def pr_text():
        return ui.markdown("<h2 style='text-align: center;'>All-Time Personal Bests</h2>")

    @render.ui
    def add_line():
        return ui.markdown("<hr>")

    @render.ui
    def add_space():
        return ui.markdown("<br>")
    @render.ui
    def add_line2():
        return ui.markdown("<hr>")

    @render.ui
    def add_space2():
        return ui.markdown("<br>")

    @render.ui
    @reactive.event(input.analysis, input.exercise, input.file_input)
    def time_period():
        if (input.analysis() == "1"):
            exercises = parse_exercise().copy()
            exercises['Date'] = pd.to_datetime(exercises['Date'])
            first_date = exercises['Date'].min()
            last_date = exercises['Date'].max()
            return ui.input_date_range("date_range", "Select Time Period", start=first_date, end=last_date, min=first_date, max=last_date+pd.DateOffset(days=1))
        else:
            data = parse_data().copy()
            data['Date'] = pd.to_datetime(data['Date'])
            first_date = data['Date'].min()
            last_date = data['Date'].max()
            return ui.input_date_range("date_range", "Select Time Period", start=first_date, end=last_date, min=first_date, max=last_date+pd.DateOffset(days=1))

    @render.text
    @reactive.event(input.exercise, input.file_input, input.date_range, input.analysis)
    def best_pr():
        if input.analysis() == "1":
            exercise = parse_exercise().copy()
            exercise['Data_dt'] = pd.to_datetime(exercise['Date']).dt.date
            start_date, end_date = input.date_range()
            mask = (exercise['Data_dt'] >= start_date) & (exercise['Data_dt'] <= end_date)
            exercise = exercise.loc[mask]
            exercise_max = exercise['Weight'].max()
            return f"Exercise Best: {exercise_max:.2f} lbs"

    @render.text
    @reactive.event(input.exercise, input.file_input, input.date_range, input.analysis)
    def average_volume():
        if input.analysis() == "1":
            exercise = parse_exercise().copy()
            exercise['Data_dt'] = pd.to_datetime(exercise['Date']).dt.date
            start_date, end_date = input.date_range()
            mask = (exercise['Data_dt'] >= start_date) & (exercise['Data_dt'] <= end_date)
            exercise = exercise.loc[mask]
            exercise['Volume'] = exercise['Weight'] * exercise['Reps']
            average_volume = exercise['Volume'].mean()
            return f"Average Volume: {average_volume:.2f} lbs"

    @render.text
    @reactive.event(input.exercise, input.file_input, input.date_range, input.analysis)
    def total_volume():
        if input.analysis() == "1":
            exercise = parse_exercise().copy()
            exercise['Data_dt'] = pd.to_datetime(exercise['Date']).dt.date
            start_date, end_date = input.date_range()
            mask = (exercise['Data_dt'] >= start_date) & (exercise['Data_dt'] <= end_date)
            exercise = exercise.loc[mask]
            exercise['Volume'] = exercise['Weight'] * exercise['Reps']
            total_volume = exercise['Volume'].sum()
            return f"Total Volume: {total_volume:.2f} lbs"

    @render.ui
    @reactive.event(input.analysis)
    def plot_stats():
        if input.analysis() == "1":
            return ui.layout_column_wrap(
                        ui.value_box(
                            "",
                            ui.output_text("best_pr"),
                            theme="yellow",
                        ),
                        ui.value_box(
                            "",
                            ui.output_text("average_volume"),
                            theme="orange",
                        ),
                        ui.value_box(
                            "",
                            ui.output_text("total_volume"),
                            theme="purple",
                        ),
                        fill=True,
                    )
    
app = App(app_ui, server)