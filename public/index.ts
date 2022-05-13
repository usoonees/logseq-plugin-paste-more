import "@logseq/libs"
import TurndownService from 'turndown';
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

  async function pasteHandler(e: ClipboardEvent) {
    if(e.clipboardData.files.length > 0) {
      return
    }

    const html = e.clipboardData.getData('text/html')
    if(html !== "") {
      e.preventDefault()
      e.stopPropagation()

      const block = await logseq.Editor.getCurrentBlock()
      const markdown = turndownService.turndown(html).trim()
      console.log("markdown source", markdown)

      const newBlocks = splitBlock(markdown).map((b) => {
        return {
          ...b,
          children: b.children.length ? b.children : undefined,
        };
      });

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
