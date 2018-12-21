# The Walking Data
Welcome to the repo containing the Walking Data website. This project was initiated thanks to the assignment given in the "Data Visualization" course taught at EPFL.
The objective of the website is to present pedestrian tracking data from research taking place in the TRANSP-OR lab at EPFL (http://transp-or.epfl.ch/). 

**You can have a look at the final result here: http://transporsrv2.epfl.ch**

## Contents
The html pages are located in the root of the repo. The website structure itself is simple. The magic happens thanks to Javascript, the D3 library, and the THREE js library! Normally, with each function used in any of the JS file, we give the path to find it. So, it shouldn't be a problem to navigate between the functions. In addition, the name of the js files are quite explanatory.

#### assets/
Contains templates and static data like the favicon, the font used for the website, some images and the process book. There is also one big and *ugly* theme.css file containing all the css used in the HTML pages.

#### css/
Quite self explanatory. Bootstrap is used to manage many aspects of the buttons, navigation bar and the styling.

#### js/
This directory contains the basic js code which handles the collecting of the data, initialization of the visualization and the animation when the website is first loaded. We also added all the libraries here.

#### visualization/
The heart of the website. Here all the functionalites regarding the visualization of the pedestrian tracking data takes place.
There are three subdirectories with the 2D, 3D and statisitcal functionalites are defined.

>###### 2D
>There is only one subfolder in this folder named *js*. It contains all the functionalities for the pedestrians moving in 2D, >voronoi diagrams, and trajectory plotting.

>###### 3D
>There are three subfolders in this folder. One is for the different textures, named *assets*, one is for the different 3D >models, named *models*, and the final and most important one is named *js*. It contains all the functions to make the >zombies alive in a creepy 3D environment.

>###### stats
>There are two subfolders in this folder. One is for the mustache templates, named *templates*, and the second one is the >*js* folder. In the latter, you will find all the functions to draw the histograms and the OD chord diagram.

## Requirements
- Apache server for hosting the website
- back-end data processing server from: https://github.com/NicholasMolyneaux/data-viz-backend for processing, storing and getting the data.
