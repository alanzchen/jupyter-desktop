<img src="https://i.loli.net/2020/11/18/LDdrkAqs4JmwjGu.png" width="100">

# Jupyter Desktop
Standalone macOS App for Jupyter Lab or Jupyter Notebook

# Features

 - A standalone app for your Jupyter Lab / Notebook. No more finding Jupyter Lab under your piles of browser tabs!
 - Directly drag & drop a folder to the Jupter Desktop's Dock icon and launch a Jupyter Lab session. It even kills the Jupyter Lab seesion when you close the window.
 - Support multiple instances.
 - Prefer launching from Terminal? Sure thing.
 - Big Sur ready.

# Installation & Usage

Grab a copy from the [release page](https://github.com/alanzchen/jupyter-desktop/releases/).

You can now open the app, drag & drop a folder to launch a Jupyter Lab there!

If you prefer to launch from terminal, follow the steps below:

## Launching from Terminal

You need to generate a configuration file for your Jupyter Lab, if you havn't already.

```
jupyter lab --generate-config
jupyter notebook --generate-config # or for Notebook
```

Then you need to add the following line in your configuration file `~/.jupyter/jupyter_notebook_config.py`.

```
c.LabApp.browser = '/Applications/Jupyter\ Desktop.app/Contents/MacOS/Jupyter\ Desktop %s'
c.NotebookApp.browser = '/Applications/Jupyter\ Desktop.app/Contents/MacOS/Jupyter\ Desktop %s' # or also for Notebook
```

Now you can normally start a Jupyter Lab or Notebook session in terminal.

```
jupyter lab
# or
jupyter notebook
```
