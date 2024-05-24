# CS 498 E2E Final Project (sp24) repo for NetID: adrian11

Purpose/Context: [Strong Workout Tracker Gym Log](https://www.strong.app) is an app available on iOS and Android, however some of its features are hidden behind a paywall. The primary feature is the ability to view your 1 rep max prediction on any exercise of your choice. The Strong App however does let you export your data as a csv file, hence why I created this python application, that not only allows you to view your 1 rep max on any exerciese free of charge, but also grants you the ability to view your all time best for a given exercise, and given a date range see how your workout volume compares on the the average workout volume in a given time period.

Set-Up:

1. Download the Repository
2. pip install uv (if you don't already have uv)
3. uv venv
4. Activate the virtual environment, which the terminal should tell you how to do
5. uv pip install -r requirements.txt
6. Once you have done all those steps, download the Shiny Extension in VsCode
7. Then just run the shiny extension or in terminal do 'shiny run'

Alternative Set Up:

1. The application is live, so click here to [use](https://adrianlara.shinyapps.io/strong_data_analysis/)

Usuage:

1. Once the application is up and running, either analyze the workout data I have provided or upload your own for analysis
2. A drop down menu will allow you to chose an exercise for 1 Rep Max prediction, so choosing a different exercise would alter the graph displayed
3. A Date Range Input is available to help you adjust the the time period of the graph, not only does this determine what days are displayed but it also modifies the average workout volume
4. When selecting an exercise to view the 1 rep max prediction, a table will also be displayed showing all the data associated with that specific exercise
5. The all time personal bests for bench, deadlift, and squat will be displayed when workout data is uploaded
6. Under the exercise drop down menu, the total number of reps and sets performed for that exercise are displayed
7. Finally when you select and exercise to perform the 1 rep max prediction, the total volume, average volume, and personal best for that exercise given the time period are shown underneath the graph

Sources:

* 1 Rep Max Prediction Formula = weight * (1 + (reps/30)) developed by Epley.
  * Epley, B. Poundage chart. In: Boyd Epley Workout. Lincoln, NE: Body Enterprises, 1985. p. 86.
