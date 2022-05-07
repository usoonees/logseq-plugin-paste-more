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

  mainContentContainer.addEventListener("paste", (e) => {
    const html = e.clipboardData.getData('text/html')
    if(html !== "") {
      const markdown = turndownService.turndown(html)
      console.log("markdown", markdown);
      logseq.Editor.insertAtEditingCursor(markdown)

      e.preventDefault()
      e.stopPropagation()
    }
  })

}


logseq.ready(main).catch(console.error)
