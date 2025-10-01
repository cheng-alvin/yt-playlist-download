# `yt-playlist-download.js`

Dumb script to download a playlist of songs through a supplied YouTube Music URL; natively integrates album and artist names embedded from the source's metadata. 
This script is dependent on the following dependencies: `yt-dlp` and `ffmpeg` that is to be installed and accessible in the same directory as this script. 

The commands for `yt-dlp` and `ffmpeg` can be modified to suit needs and environment which is accesible through the modification of specially marked constant variables. Modify the `ytdlp` and `ffmpeg` variables to modify their respective commands.

### Usage
``` sh
$ node song-download.js <YouTube Music Playlist URL>
```

**Note:** The output directory is set to `./downloaded_songs/` by default, or as specified in the `outDir` variable, not to be confused with `outputDir` denoting the directory for the output of `yt-dlp` (really badly named).

---
*Previous source code has been hosted outside of a version control system [here](https://gist.github.com/cheng-alvin/3904f2da19b054d2f6dda7a8a8782670), previous changes to code may be found in [`CHANGELOG`](https://github.com/cheng-alvin/yt-playlist-download/blob/main/CHANGELOG)*
