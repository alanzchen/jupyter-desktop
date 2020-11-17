# jupyter-desktop
Standalone Desktop App for Jupyter Lab

# Installation

Grab a copy from the [release page](https://github.com/alanzchen/jupyter-desktop/releases/).

Then you need to generate a configuration file for your Jupyter Lab, if you havn't already.

```
jupyter lab --generate-config
```

Then you need to add the following line in your configuration file `~/.jupyter/jupyter_notebook_config.py`.

```
c.LabApp.browser = '/Applications/Jupyter\ Desktop.app/Contents/MacOS/Jupyter\ Desktop %s'
```

Now you can normally start a Jupyter Lab session in terminal.

```
jupyter lab
```