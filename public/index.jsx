import "@logseq/libs"
import TurndownService from 'turndown';

async function main() {
  let mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )

  const turndownService = new TurndownService({
    "headingStyle": "atx",
    "codeBlockStyle": "fenced",
  })

  turndownService.remove('style')

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
