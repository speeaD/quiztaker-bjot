# Score memes

Add image files to the folder for the student's score. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, and `.avif`. The site picks one image at random from the matching folder each time a result is shown. Subfolders and other file types are ignored.

| Folder | Scores |
| --- | --- |
| `0-10` | 0% to less than 10% |
| `10-20` | 10% to less than 20% |
| `20-30` | 20% to less than 30% |
| `30-40` | 30% to less than 40% |
| `40-50` | 40% to less than 50% |
| `50-60` | 50% to less than 60% |
| `60-70` | 60% to less than 70% |
| `70-80` | 70% to less than 80% |
| `80-90` | 80% to less than 90% |
| `90-100` | 90% through 100% |

The current images in the root of `public/memes` remain as fallback images while a score folder is empty. Once you add images to a folder, only those images are used for that score range. Deploy the updated `public/memes` files to make them available on the live site.
