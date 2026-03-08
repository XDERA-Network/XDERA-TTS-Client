# XDERA TTS Client

A simple real-time Text-to-Speech client for the XDERA TTS API.  
This repository provides minimal reference implementations showing how to connect to the API, stream generated audio, and play it immediately with very low latency.

The project is designed to be straightforward and easy to understand so developers can quickly experiment with real-time speech synthesis or integrate the API into their own applications.

---

## Get an API Key

You can obtain a free API key through the community Discord server.

[![discord](https://img.shields.io/badge/Discord-blue?style=for-the-badge)](https://discord.com/invite/mtvsj2TqXF)

Join the server, request an API key, and you will be able to use the examples in this repository.

---

## Overview

This repository demonstrates how to:

- Send text requests to the TTS API
- Receive audio as a continuous stream
- Play synthesized speech in real time
- Display a basic audio visualization during playback

Both a browser-based interface and a Python example are included to demonstrate different ways of interacting with the service.

---

## Repository Structure

```
web_example/
    Basic browser client for sending text and playing streamed audio

example.py
    Python command-line example for streaming and playing generated speech

requirements.txt
    Dependency list required for the Python example
```

---

## Requirements

To run the examples you will need:

- A valid API key
- Python 3.9 or newer (for the Python client)
- A modern web browser (for the web interface)

---

## Setup

Clone the repository:

```bash
git clone https://github.com/XDERA-Network/XDERA-TTS-Client.git
cd XDERA-TTS-Client
```

---

## Using the Web Client

1. Open the `web_example` directory.
2. Edit the file `script.js`.
3. Locate the API key configuration near the top of the file:

```javascript
const API_Flavour = "[ENTER_YOUR_API_KEY_HERE!]";
```

4. Replace the placeholder with your API key.
5. Open `index.html` in your browser.
6. Enter text and generate audio.

The page will request speech from the API and start playing the stream as soon as audio data begins arriving.

---

## Using the Python Example

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Open `example.py` and find the header configuration:

```python
headers = {"x-api-key": "[ENTER_YOUR_API_KEY_HERE!]"}
```

Replace the placeholder with your API key.

Run the script:

```bash
python example.py
```

The program will send a request to the API, receive the audio stream, and play it in real time while displaying a simple terminal visualization.

---

## Purpose

This repository serves as a minimal reference client for the XDERA TTS API.  
The implementation is intentionally simple so the streaming flow can be easily understood and adapted for other applications.
