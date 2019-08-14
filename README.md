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


<a id="overridelens"></a>
## 3. Overriding Lens

<a id="helpers"></a>
## 4. JQuery Helpers