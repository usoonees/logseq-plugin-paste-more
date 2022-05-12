import "@logseq/libs"
import TurndownService from 'turndown';
import {gfm} from '@guyplusplus/turndown-plugin-gfm'

async function main() {
  let mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )

  const turndownService = new TurndownService({
    "headingStyle": "atx",
    "codeBlockStyle": "fenced",
    "hr": "---",
  })

  gfm(turndownService)

  turndownService.remove('style')
  turndownService.addRule( 'pre', {
    filter: [ 'pre' ],
    replacement: content => {
        return '```\n' + content.trim() + '\n```'
    }
  });

  turndownService.escape = (string) => {
    return string
  }

  const pasteHandler = (e) => {
    if(e.clipboardData.files.length > 0) {
      return
    }

    const html = e.clipboardData.getData('text/html')
    if(html !== "") {
      // console.log("=== debug: html source\n", html);
      const markdown = turndownService.turndown(html).trim()
      // console.log("=== debug: markdown result\n", markdown);
      logseq.Editor.insertAtEditingCursor(markdown)

      e.preventDefault()
      e.stopPropagation()
    }
  }

  mainContentContainer.addEventListener("paste", pasteHandler)

  logseq.beforeunload(async () => {
    mainContentContainer.removeEventListener("paste", pasteHandler)
  })
}


logseq.ready(main).catch(console.error)
