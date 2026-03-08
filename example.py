import asyncio
import websockets
import json
import base64
import pyaudio
import math
import struct

async def RCE():
    uri = "wss://server.rce.my.id/xdera/project/api/tts"
    say = """[bright playful energy, quick chatter] heey look who finally showed up, took you long enough you know, [teasing flirty tone] were you getting ready or something or do you just like making me wait on purpose, [light smug laugh, playful energy] wow you really are the worst sometimes but somehow it is still kinda fun hanging around you, [tone softens for a moment] besides it is nicer than going home too early, that place gets really quiet at night, [brief distant tone, almost casual but heavy underneath] ever since everyone left it just feels like a big empty room anyway, [quick upbeat switch, playful again] so yeah you are basically my excuse to stay out longer now, lucky you, [cheeky flirty finish] so do not disappear on me okay~"""
    headers = {"x-api-key": "[ENTER_YOUR_API_KEY_HERE!]"}
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=24605, output=True)

    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print("Connected! Waiting response...")
            await websocket.send(say)
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                
                if "audio_chunk" in data:
                    audio_data = base64.b64decode(data["audio_chunk"])
                    chunk_size = 2048
                    for i in range(0, len(audio_data), chunk_size):
                        sub_chunk = audio_data[i:i+chunk_size]
                        count = len(sub_chunk) // 2
                        if count > 0:
                            shorts = struct.unpack(f"{count}h", sub_chunk)
                            rms = math.sqrt(sum(s*s for s in shorts) / count)
                            bar = int(min(rms / 500, 40))
                            print(f"\r│{'█' * bar}{' ' * (40 - bar)}│", end="", flush=True)
                        stream.write(sub_chunk)
                
                if data.get("done"):
                    print("\nDone.")
                    await asyncio.sleep(1.5)
                    break
    except:
        pass
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    asyncio.run(RCE())
