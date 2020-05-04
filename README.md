DAI Lens
========

This document will guide you through the usage of the DAI integration for the Lens parser. The Lens official documentation is available here: [Lens Manual](http://github.com/elifesciences/lens). 
## Table Of Contents
1. [ Getting Started ](#gettingstarted) - How to start the app locally for development and live
2. [ Loading XML Documents ](#loadxml) - How to serve XML documents to the DAI Lens parser.
3. [ Overriding Lens ](#overridelens) - General description of how we override Lens default behaviours
4. [ JQuery Helpers ](#helpers) - Description of the additional JQuery helpers used


<a id="gettingstarted"></a>
## 1. Getting Started

### Running Live
  The app is currently deployed on heroku at 
  
  https://dai-lens.herokuapp.com
  
  This address will point you to a blank page since no xml document is passed in the url parameter. An example which loads an xml document would be 
  
  https://dai-lens.herokuapp.com/?url=https://bkry.gitlab.io/dai/dai-examples/0011/AA_2019_1_Schachner_2019-08-06%202019-08-07.xml

  How different xml documents can be loaded or stored will be treated in the [ Loading XML Documents ](#loadxml) section

### Building and running docker container
  docker images are build via CI pipeline and stored in the gitlab registry:
  https://gitlab.com/dainst/dai-lens/container_registry
  if you are logged in in your terminal you can pull and start the container with:
  `docker run -e PORT=80 --rm -d -p 80:80/tcp registry.gitlab.com/dainst/dai-lens:master`

  if you want to build a new image locally you can do this by:
  - go to project folder
  - build with: `PORT=80 docker build -t "dai-lens:latest" .`
  - start with: `docker run -e PORT=80 --rm -d -p 80:80/tcp dai-lens:latest`

### Running Locally
- Clone the current repository locally (ssh: `git@gitlab.com:bkry/dai/dai-lens.git`)
- Install Node if missing on your machine
- run `npm install` in the root folder of the project
- run `node server` to start the app

These steps will start a local server on your localhost at port 4001. If everything worked correctly you should see the following message in your console:
```
Lens running on port 4001
http://127.0.0.1:4001/
```

From now on you can use the address above in place of the first heroku link shown above. This means that accessing http://127.0.0.1:4001/ will again show a blank page and a url parameter is necessary to actually view a document. A working example would be:

http://127.0.0.1:4001/?url=https://bkry.gitlab.io/dai/dai-examples/0011/AA_2019_1_Schachner_2019-08-06%202019-08-07.xml

**Notice:** if you change the code you will have to refresh the page in order to see the results locally 

<a id="loadxml"></a>
## 2. Loading XML Documents
The app has to be passed an xml document in order to show some content. Lens default behaviour was to add this document locally in the Lens repository and load it from the current repository. We have enhanced the xml loading to read any xml file passed as `url` parameter to the app.

### Using The dai-examples Repository
The current list of documents is stored in the samples repository here:

https://gitlab.com/bkry/dai/dai-examples.git

Cloning this repository is only needed if you wish to upload more xml documents to it. In order to upload a document:
- clone the repository
- create a new folder in the root of the repository (by convention each document is stored in a folder named with an id, ex: 0001, 0002 etc)
- add the xml document and the resource folder to the new folder you created
- commit and push your changes
- wait for the build (approx 2 min)
- the new xml file will be available at https://bkry.gitlab.io/dai/dai-examples/YOUR_FOLDER_ID/YOUR_XML_FILE.xml
- you can use the link as `url` parameter for the DAI Lens app as shown in [ Getting Started ](#gettingstarted)

### Changing The XML Repository
The xml can be loaded from any address which serves the xml documents. When using a new repository 2 things have to be kept in mind

  1. The new repository should have CORS enabled or the app wont be able to download the xml
  2. Since lens by default can support several parsers, there is a test method which has to be defined in each parser to verify it can be used for the local document. The `dai_converter` test method, currently checks if the xml is served from the `dai-examples` repository. So if you plan to change the repository remember to change the `baseDocsURL`constant defined in the `helpers.js` file to your new repository address



<a id="overridelens"></a>
## 3. Overriding Lens
The Lens official documentation gives very few insights on how to use and override the project. This app heavily changes the basic behaviour but still runs without having to update the Lens code itself. For most of the cases, Lens provides a way to override the base behaviour to your needs, but some of the changes had to be implemented by executing JQuery code after the page is loaded. We will treat these in the next section [ JQuery Helpers ](#helpers)

In a nutshell this is how the app works.
- The xml file passed in the url is downloaded
- The `dai_converter` parses the document and generates a collection of `nodes` (figures, footnotes, references etc)
- The nodes are used to populate the left side (document text with references) and the `panels` to the right

So all the DAI specific parsing happens in the `dai_converter` which overrides the behaviour of the `lens_converter` when needed.

### Nodes
Nodes customize the way information is displayed. Lens ships with several nodes which have been reused in this project. A list of overridden and new nodes is in the src/nodes folder. Each node has an index.js file exporting a Model and a View, you can check the samples to get an idea of how to reuse Lens models and just override the view or viceversa. Just keep in mind that every new node also has to be exported by the src/nodes/index.js file in order to be used.

### Panels
The panels on the right side are used to show extra information on the part of text being read on the left side, through the use of references. Clicking on a reference on the text opens the appropriate panel, highlights the element on the panel and highlights the other references to this same element in the text.
Lens documentation only shows how to create a static panel with no reference and no scrolling behaviour. We managed to create ad-hoc panels with references by overriding the `src/article.js`. This is the only file which has been extracted from Lens since there was no way provided to override it. So keep in mind that a new version of Lens might need to integrate changes in this file in order to work in this project.

A clear example of how to generate a ResourcePanel (a panel which links to references in the text) is the `supplements` panel. Look for the word supplement in the project to get an idea. In this specific case we also created the `supplement` and `supplement_reference` nodes to make it work.

### Parser
The `dai_converter` is the place where the xml document is parsed and data is collected (in nodes). Overriding the default behaviour is as easy as copying the chosen parsing function (ex footnotes) from the `lens_converter`, pasting it in the `dai_converter` and changing the code to your needs. Most of the times (not always) there is an `enhance` method which can be used instead of copying the whole parsing function (check enhanceFigures in the official docs)

**IMPORTANT** when updating Lens, if a specific behaviour is missing, remember to integrate the changes from the new `lens_converter` in the `dai_converter` if these are not working in the DAI Lens project.

<a id="helpers"></a>
## 4. JQuery Helpers
Some of the features are implemented with JQuery and added to the page after the Lens parsing and displaying is done. All of these functions are defined in the `src/helpers.js` and called on document load. Check this file if you want to make a change to any of the following features:
- central scrollbar with figures
- mobile menu behaviour
- TOC cover image
- top bar image

## 5. Multi-Journal Feature
It is possible to adapt the Lens-Viewer to different journals using the `journals.json`.
### Default configuration
This is the default configuration. This one is hardcoded and NOT part of the `journals.json`, in case it is corrupted or missing.
Right now, `logo`, `favicon`, `topbar` and `topbar_issue` are only placeholders and shold really be overwritten.
```
{
    "xml_identifier": "*",
    "config": {
        "title": "Lens Viewer",
        "logo": "lens.png",
        "favicon": "lens.png",
        "homepage": "https://publications.dainst.org/journals/index.php",
        "colors": {
          "topbar": "black",
          "topbar_issue": "white",
          "headline": "grey",
          "secondary": "rgba(128, 0, 50)",
          "reference_highlight": "rgba(128, 0, 50, 0.1)"
        },
        "issue_pattern": "volume",
        "print": true
    }
}
```
### How it works
The default configuration applies automatically to all journals. It can be (entirely or partly) overwritten by a specific journal configuration.
This meens you should leave out the parts of the config where you wish to use the default values. In case they are changed some day your journal will then take the new default values.

* `xlm_identifier <required>`: Used to identify the journal. It is provided within the journal-id tag of the XML.
* `title`: The html-title for this journal, displayed in the browsers tab.
* `logo`: The logo in the top-left corner.
* `favicon`: The favicon next to the title.
* `homepage`: URL to another source of the journal, e.g. OJS
* `topbar`: Color used in the topbar
* `topbar_issue`: Color used in the middle of the topbar
* `headline`: Color used for important headlines
* `secondary`: Color used for highlighting citations, references and images
* `reference_highlight`: Transparent background of highlighted references (often a transparent version of secondary)
* `issue_pattern`: How the issue in the middle of the topbar will be displayed. Available patterns are "volume", "volume/year" and "year". The topbar section adaps the font size, so issues up to a number of 8 characters can be displayed in one line. After that two separate lines are used.
* `print`: Can be `false` or `true` (without " or '!). Decides if some additional print metadata should be shown or not. Use false for web-only journals. 
   
