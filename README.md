# logseq-plugin-paste-more
Retain formatting when pasting from external sources.

You can still use `mod+shift+v` to paste plain text.

**Update**: logseq has supported `Copy & Paste with rich-text formats` internally since version 0.7.1, but it doesn't parse well in some scenario. You can try this plugin to see if it pastes as your expectation.

**If you encounter any problems with pasting, please disable the plugin temporarily and submit an issue.** You can enable/disable this plugin quickly by clicking the icon, grey means enabled, red means disabled.
<p align="center">
	<img src="image/control.png" alt="drawing" width="300"/>
</p>


## Paste Demo


Paste from Excel             |  Paste from Feishu Docs Table
:-------------------------:|:-------------------------:
![Paste from Excel](image/excel.gif)  |  ![Paste from feishu table](image/table.gif)


**Paste from Github**
![paste with head](image/logseq_paste.gif)

**Paste from Google Docs**
![paste with head](image/google_docs.gif)


#### Settings
Whether indent headers?
![](image/settings.png)

#### Acknowledgement
* [turndown](https://github.com/mixmark-io/turndown) for converting html to markdown.
* [logseq-plugin-split-block](https://github.com/hyrijk/logseq-plugin-split-block) for logic of indent.