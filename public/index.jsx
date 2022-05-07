import "@logseq/libs"
import TurndownService from 'turndown';

async function main() {
  let mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )

  const turndownService = new TurndownService({
    "headingStyle": "atx",
    "codeBlockStyle": "fenced"
  })


  mainContentContainer.addEventListener("paste", (e) => {
    let result = ""
    const html = e.clipboardData.getData('text/html')
    if(html !== "") {
      result = turndownService.turndown(html)
    } else {
      result = e.clipboardData.getData('text')
    }

    logseq.Editor.insertAtEditingCursor(result)

    e.preventDefault()
    e.stopPropagation()
  })

}


logseq.ready(main).catch(console.error)
