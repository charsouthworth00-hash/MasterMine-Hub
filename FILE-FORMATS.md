# MasterMine HUB file formats

MasterMine HUB is the single launchpad for the MasterMine apps.

## Master DOCX Group

The Master DOCX Group contains these five official MasterMine project formats:

| App | Extension | What the file contains |
| --- | --- | --- |
| MasterMine Docs | `.masterdocx` | Document title, content and plain text |
| MasterMine Slides | `.masterslides` | Slide titles and content |
| MasterMine Notes | `.masternote` | Notes text |
| MasterMine Sheets | `.mastersheet` | Spreadsheet cell data, including formulas as entered |
| MasterMine Studio | `.mastercanvas` | Editable artwork image data and canvas dimensions |

These are MasterMine-owned, versioned JSON-based project files. They are **not** Microsoft Office file formats, even when an extension resembles one. The filename field in each app controls the downloaded name; the app adds the correct extension automatically. Opening a file checks its format identifier, version and official extension.

## Other HUB apps

Apps outside the Master DOCX Group do not have a custom MasterMine extension defined here. Where an app offers a data snapshot, it uses ordinary `.json` rather than another invented `.master...` ending. An export only includes the data described by that app; for example, Drive's JSON snapshot stores file details, not the original file contents.

## Format versioning

Files include a `format` identifier, `formatVersion: 1`, and an `extension` value. Importers should check these fields and validate the data fields used by the app. Keep each extension stable; increment the format version if the structure changes incompatibly.

MasterMine NEWS currently opens as an external app and does not export a MasterMine project file.
