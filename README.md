# The Walking Data
Welcome to the repo containing the Walking Data website. This project was initiated thanks to the assignment given in the "Data Visualization" course taught at EPFL.
The objective of the website is to present pedestrian tracking data from research taking place in the TRANSP-OR lab at EPFL (http://transp-or.epfl.ch/).

## Contents
The html pages are located in the root of the repo. The website structure itself is simple. The magic happens thanks to Javascript and the D3 library.
##### assets/
Contains templates and static data like the favicon and the font used for the website.
##### css/
Quite self explanatory. Bootstrap is used to manage many aspects of the buttons, navigation bar and the styling.

##### js/
This directory contains the basic js code which handles the collecting of the data, initialization of the visualization and the animation when the website is first loaded.

##### node_modules/
External library for handling the slider

##### visualiztion/
The heart of the website. Here all the functionalites regarding the visualization of the pedestrian tracking data takes place.
There are three subdirectories with the 2D, 3D and statisitcal functionalites are defined.
###### 2D
Visualization of the pedestrians moving in 2D, voronoi diagrams, trajectory plotting.
###### 3D
Zombies, humans in 3D.
###### stats
OD chord diagram, histogram, interactions between 2D and travel time/density histograms.

## Requirements
- Apache server for hosting the website
- back-end data processing server from: https://github.com/NicholasMolyneaux/data-viz-backend for processing, storing and getting the data.
