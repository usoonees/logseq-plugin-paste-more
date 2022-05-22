import "@logseq/libs"
import TurndownService from './turndown.js';
import {gfm} from '@guyplusplus/turndown-plugin-gfm'
import { splitBlock } from "./splitBlock";

async function main() {
  let mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )
  
  const turndownService = new TurndownService({
    "headingStyle": "atx",
    "codeBlockStyle": "fenced",
    "hr": "---",
    // @ts-ignore
    "bulletListMarker": "",
  })

  turndownService.addRule( 'pre', {
    filter: [ 'pre' ],
    replacement: content => {
        return '```\n' + content.trim() + '\n```'
    }
  });

  gfm(turndownService)

  turndownService.remove('style')

  // @ts-ignore
  turndownService.escape = (string) => {
    return string
  }

  async function pasteHandler(e: ClipboardEvent) {
    if(e.clipboardData.files.length > 0) {
      return
    }

    const html = e.clipboardData.getData('text/html')

    if(html !== "") {
      e.preventDefault()
      e.stopPropagation()

      const block = await logseq.Editor.getCurrentBlock()
      // @ts-ignore
      let markdown: string = turndownService.turndown(html).trim()
      // console.log("html source\n", html)

      if(markdown.length > 6
        && markdown.slice(0, 3) === "**\n" 
        && markdown.slice(markdown.length-3) === "\n**") {
        markdown = markdown.slice(3, markdown.length-3) // remove google docs **
      }

      // console.log("markdown result\n", markdown)

      if(block && block.content.startsWith('#+')){
        await logseq.Editor.insertAtEditingCursor(markdown)
        return
      }

      const newBlocks = splitBlock(markdown).map((b) => {
        return {
          ...b,
          children: b.children.length ? b.children : undefined,
        };
      });
      
      if (newBlocks.length === 0) {
        await logseq.Editor.insertAtEditingCursor(markdown)
        return
      } 

      await logseq.Editor.insertBatchBlock(block.uuid, newBlocks, {
        sibling: true,
      });
    }
  }

  mainContentContainer.addEventListener("paste", pasteHandler)

  logseq.beforeunload(async () => {
    mainContentContainer.removeEventListener("paste", pasteHandler)
  })
}


logseq.ready(main).catch(console.error)
