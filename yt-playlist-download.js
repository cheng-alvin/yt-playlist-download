/**
 * Dumb script to download a playlist of songs through a supplied YouTube Music
 * URL; natively integrates album and artist names embedded from the source's
 * metadata. Requires `yt-dlp` and `ffmpeg` to be installed and accessible in
 * the same directory as this script. Also requires `node` to run.
 *
 * @note The commands for `yt-dlp` and `ffmpeg` can be modified to suit your
 * operational needs and environment. Constants to change such commands are
 * presented below:
 *
 * @usage $ node song-download.js <YouTube Music Playlist URL>
 *
 * @note The output directory is set to `./downloaded_songs/` by default and
 * can be modified below where required.
 *
 * @license MIT
 * Copyright (c) 2025 Alvin Cheng <eventide1029@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @changelog
 * - 2025-09-24: Initial release
 *
 * - 2025-09-24 (2nd):
 *   - Fixed bugs where non-blocking event loop causes files to be
 *     processed repeatedly; now uses synchronous file system calls
 *     which mitigates the issue.
 *   - Allows downloads to be organized in a specified output directory.
 *   - Changed separators between artist, title, and album of unicode (U+200E)
 *     rather than commonly used `-`es to avoid conflict with content.
 *
 * - 2025-09-25:
 *    - Remove explicit requirement to exit process where an error has been
 *      thrown to prevent blocking the whole download process.
 *    - Strip more async operations down into synchronous ones to prevent
 *      race conditions as previously observed.
 *
 * @note This script is designed for macOS; it may work on Linux but is not
 * guaranteed to do so. Windows is also unsupported due to its deviation from
 * unix-like shell standards.
 */

// Modify where required:

const ytdlp = './yt-dlp_macos';
const ffmpeg = 'ffmpeg';

// Change output directory if required:
const outDir = './downloaded_songs/';
const outputDir = './';  // Temporary download directory

const {exec, execSync} = require('node:child_process');
const fs = require('node:fs');

fs.mkdirSync(outDir, {recursive: true});

const link = process.argv[process.argv.length - 1];

// clang-format off

const downloadCommand = `${ytdlp} ${link} -f "bestaudio[ext=m4a]" --embed-thumbnail ` +
    `--convert-thumbnail jpg --exec-before-download "ffmpeg -i %(thumbnails.-1.filepath)q ` +
    `-vf crop=\\"'if(gt(ih,iw),iw,ih)':'if(gt(iw,ih),ih,iw)' \\" _%(thumbnails.-1.filepath)q" ` +
    `--exec-before-download "rm %(thumbnails.-1.filepath)q" --exec-before-download "mv _%` +
    `(thumbnails.-1.filepath)q %(thumbnails.-1.filepath)q" --output "%(artist)s ‎ %(title)s`+
    ` ‎ %(album)s.%(ext)s"`;

// clang-format on

exec(downloadCommand, (err) => {
  if (err) {
    console.error(
        `Error executing command: ${err.message} (will continue regardless)`);
  }

  try {
    const m4aFiles =
        fs.readdirSync(outputDir).filter(file => file.endsWith('.m4a'));

    for (const file of m4aFiles) {
      // Filename format: Artist ‎ Title ‎ Album.m4a
      // Note: The space between the fields is a special unicode character
      // (U+200E) which is different from a regular space (U+0020). This is to
      // avoid issues with artist/album names that contain spaces.

      const match = file.match(/^(.+?)‎(.+?)‎(.+?)\./);
      const artist = match[1].replace('NA', '-').trim()
      const title = match[2].trim()
      const album = match[3].replace('NA', '-').trim()

      console.log(`Title: ${title}, Artist: ${artist}, Album: ${album}`);
      // clang-format off

      const editMeta = 
        `${ffmpeg} -i "${file}" -metadata artist="${artist}" -metadata album="${album}" -codec ` +
        `copy temp.m4a && mv temp.m4a "${outDir}/${title}.m4a"`;

      // clang-format on

      execSync(editMeta)
      fs.unlinkSync(file);
    }
  } catch (readErr) {
    console.error(`Error reading directory: ${readErr.message}`);
    return;
  }
});
