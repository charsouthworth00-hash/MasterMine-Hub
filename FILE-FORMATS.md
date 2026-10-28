# MasterMine HUB file formats

MasterMine HUB is the single launchpad for the MasterMine apps. New apps should be added to the HUB app list so people can open them from the same workspace.

The file extensions below are MasterMine's own versioned, JSON-based project formats. They are not Microsoft Office file formats, even when an extension has a similar name.

| App | Extension | What the file contains |
| --- | --- | --- |
| MasterMine Docs | `.masterdocx` | Document title, HTML-safe content and plain text |
| MasterMine Slides | `.masterslides` | Slide titles and content |
| MasterMine Sheets | `.mastersheets` | Spreadsheet cell data, including formulas as entered |
| MasterMine Studio | `.masterstudio` | Artwork image data and canvas dimensions |
| MasterMine Drive | `.masterdrive` | A backup of the local file list and metadata, not the actual files |
| MasterMine GX | `.mastergx` | GX quick-link shortcuts |
| MasterMine Meet | `.mastermeet` | Meeting name, date/time and invitation draft; it does not create a live call |
| MasterMine Chat | `.masterchat` | A local message-board history |
| MasterMine Mail | `.mastermail` | One email draft; it does not send email |
| MasterMine Notes | `.masternotes` | Notes text |
| MasterMine Planner | `.masterplan` | Tasks and completion status |

## Format versioning

Files include a `format` identifier and `formatVersion: 1`. Importers should check both before opening the file, then validate the data fields used by the app. Keep the extension stable for a file type; increment the format version if the structure changes incompatibly.

MasterMine NEWS currently opens as an external app and does not export a MasterMine project file.
