# jupyter-desktop
Standalone Desktop App for Jupyter Lab or Jupyter Notebook

# Installation

Grab a copy from the [release page](https://github.com/alanzchen/jupyter-desktop/releases/).


## For Jupyter Lab

You need to generate a configuration file for your Jupyter Lab, if you havn't already.

```
jupyter lab --generate-config
jupyter notebook --generate-config # or for Notebook
```

Then you need to add the following line in your configuration file `~/.jupyter/jupyter_notebook_config.py`.

```
c.LabApp.browser = '/Applications/Jupyter\ Desktop.app/Contents/MacOS/Jupyter\ Desktop %s'

# or also for Notebook

c.NotebookApp.browser = '/Applications/Jupyter\ Desktop.app/Contents/MacOS/Jupyter\ Desktop %s'
```

Now you can normally start a Jupyter Lab or Notebook session in terminal.

```
jupyter lab
jupyter notebook
```