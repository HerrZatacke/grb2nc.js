# grb2nc.js (TypeScript based Gerber to gCode transformer)

grb2nc is a simple open-source online Gerber to gCode transformer. If you need to create gCode for your PCB prototypes, this tool can help you.

Try the [deployed version on GitHub Pages](http://herrzatacke.github.io/gb-printer-web/grb2nc.js/)

![Application Screenshot](/public/screenshot1.png)
![Application Screenshot](/public/screenshot2.png)  

## Inspiration
Seeing [Mathias Wandel's YouTube video](https://www.youtube.com/watch?v=hlvHNgOD__Y) on his [Python based approach](https://github.com/Matthias-Wandel/Gerber2nc) and having struggled with various programs too, gave me the idea to build a web-based tool for generating simple gCode.  
I wanted to make the configuration more accessible to non-developers though.  

## Features
The app allows setting various parameters for your milling/engraving operations: 
![Application Screenshot - Milling operations dialog](/public/screenshot3.png)

Each layer can run with separate offset and number of steps
![Application Screenshot - Offset and steps dialog](/public/screenshot4.png)


## Serverless
This software is running entirely in your Browser, including processing of your gerber files, so your files do not need to be sent to a server. 


## Contributing/Bugs
* This software was written within a few days as _a private project_. It probably has some bugs.
* If you want to give feedback open an issue or [contact me on bluesky](https://bsky.app/profile/zatacke.bsky.social)
* If you have any ideas on how to improve this software, pull requests are welcome. Also let's discuss in the issues or [bsky](https://bsky.app/profile/zatacke.bsky.social)
* If you report a bug, include all relevant information to the matter (e.g. gerber files, browser brand and version, etc...) 


## Disclaimer
* Don't rely on my predefined values for speeds, feeds, etc.
* You should know how to handle your machining equipment before using this software.
* Verify the generated gCode before running it. If you don't know how, don't do.
* If you break something it's your own fault.
* Use common sense.


## Used Software/Packages
* For packages/modules used in this software, check the [package.json](./package.json)
