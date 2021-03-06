# Installing *Teams Carousel* extension for Microsoft Edge

It is necessary to run the latest [Microsoft Edge](https://www.microsoft.com/edge) version for PC or Mac. Go to the extension store page [Teams Carousel](https://microsoftedge.microsoft.com/addons/detail/oaoljfeoolhboidooldgbnefaeicneml) and install the extension.

# Installing *Teams Carousel* Chrome extension

Apparently Chrome disabled manual upload of extensions packaged as CRX files (those still generated by the tools in developer mode). Until the Google Chrome developer dashboard will allow for new submissions (it currently reports internal server error when I'm trying to upload the extension) you will have to manually load the extension (which is not a terribly difficult task):

1. Download the zip file [TeamsCarousel.zip](https://github.com/Unipisa/TeamsCarousel/raw/master/packages/TeamsCarousel.zip) containing the sources of the extension and extract it in your system
2. Navigate to **chrome://extensions** for Chrome 
3. Enable the developer mode (right top corner on Chrome, left bottom on Edge)
4. Select the button "Load unpacked extension"
5. Browse to the directory containing the unpacked files of the extension
6. Select the folder

The extension will show up in the list of installed extensions.

## Using the extension

> *Recommended use:* Web browser version of Microsoft Teams allows only for one video stream at a time (only the app supports the 3x3 grid). It is recommended to connect to the call with the app *and* with the Web Browser using a muted tab without camera and mic to operate with TeamsCarousel. In this way the web browser will iterate among the video streams and in case of bugs you will be able to reload the page without disrupting the call.


The extension is shown on the right of the address bar

![Image](https://github.com/Unipisa/TeamsCarousel/raw/master/img/img1.png)

It will be enabled only when browsing the Web site https://teams.microsoft.com

During a call click on the icon to get the following menu:

![Image](https://github.com/Unipisa/TeamsCarousel/raw/master/img/img2.png)

Press play to start the carousel. You can change the interval duration at any time by changing the number of seconds in the menu. 

Use the *Mute* option allows easily muting the tab to avoid interference if connected to the meeting also with the native client and the browser is only used to monitor participants.

It is possible to split monitoring among different participants using the *breakout* function and setting the number the portion and the total number of portions. This way it will be possible to split participant monitoring in a call. 

## Upgrade the extension

Simply unzip the files in the directory of the extension and tap reload in the browser extensions page.