import "@logseq/libs"
import TurndownService from './turndown.js';
import {gfm} from '@guyplusplus/turndown-plugin-gfm'
import { splitBlock } from "./splitBlock";

async function main() {
  logseq.useSettingsSchema([
  {
    key: "indentHeaders",
    title: 'Whether to indent headers',
    type: "boolean",
    default: true,
    description: ''
  },
  {
    key: "newLineBlock",
    title: 'Whether create a new block for new line',
    type: "boolean",
    default: true,
    description: ''
  },
  {
    key: "KeyboardShortcut_paste",
    title: 'Keyboard shortcut to enable/disable this plugin',
    type: "string",
    default: "mod+ctrl+shift+v",
    description: ''
  },
  {
    key: "enablePasteMore",
    title: 'Enable paste more',
    type: "boolean",
    default: true,
    description: ''
  }
]);

  function createModel() {
    return {
      controlUsage
    };
  }
  logseq.provideModel(createModel());


  let enable = logseq.settings.enablePasteMore;
  const enableIcon = "ti-clipboard"
  const disableIcon = "ti-clipboard-x"
  let triggerIconName = enable? enableIcon: disableIcon;

  logseq.App.registerUIItem("toolbar", {
    key: "paste-plugin-button",
    template: `
    <a class="button" data-on-click="controlUsage" data-rect>
      <i class="ti ${triggerIconName}"></i>
    </a>
  `});
  const css = (t, ...args) => String.raw(t, ...args);

  let mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )
  const turndownService = new TurndownService({
    "headingStyle": "atx",
    "codeBlockStyle": "fenced",
    "hr": "---",
    "bulletListMarker": '',
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
    const pasteTypes = e.clipboardData.types

    if(pasteTypes.includes("Files") && !pasteTypes.includes("text/plain")) {
      console.log("use logseq default action")
      return
    }

    const html = e.clipboardData.getData('text/html')

    if(html !== "" &&
      (html.length < 45 || html.slice(22, 45) != '<!-- directives: [] -->') // within logseq
      ) { 
      e.preventDefault()
      e.stopPropagation()

      const block = await logseq.Editor.getCurrentBlock()
      // @ts-ignore
      let markdown: string = turndownService.turndown(html)
      // console.log("html source\n", html)
      // console.log("markdown result\n"+markdown)

      if(markdown.length > 6
        && markdown.slice(0, 3) === "**\n" 
        && markdown.slice(markdown.length-3) === "\n**") {
        markdown = markdown.slice(3, markdown.length-3) // remove google docs **
      }


      if((block && block.content.startsWith('#+')) || logseq.settings?.newLineBlock === false) {
        await logseq.Editor.insertAtEditingCursor(markdown.trim())
        return
      }

      const newBlocks = splitBlock(markdown, logseq.settings?.indentHeaders).map((b) => {
        return {
          ...b,
          children: b.children.length ? b.children : undefined,
        };
      });
      
      if (newBlocks.length === 0) {
        await logseq.Editor.insertAtEditingCursor(markdown.trim())
        return
      } 

      await logseq.Editor.insertBatchBlock(block.uuid, newBlocks, {
        sibling: true,
      });
    }
  }
  if (enable) {
    mainContentContainer.addEventListener("paste", pasteHandler)
  }

  logseq.beforeunload(async () => {
    mainContentContainer.removeEventListener("paste", pasteHandler)
  })

  async function controlUsage() {
    enable = !enable
    logseq.updateSettings({"enablePasteMore": enable})
    if(enable) {
      parent.document.querySelector(`.ti.${disableIcon}`).classList.replace(disableIcon, enableIcon)
      mainContentContainer.addEventListener("paste", pasteHandler)
      logseq.UI.showMsg("Enable paste more plugin", "success");
    } else {
      parent.document.querySelector(`.ti.${enableIcon}`).classList.replace(enableIcon, disableIcon)
      mainContentContainer.removeEventListener("paste", pasteHandler)
      logseq.UI.showMsg("Disable paste more plugin", "success");
    }
  }

  logseq.App.registerCommandPalette({
    key: `paste-keyboard-shortcut`,
    label: "enable/disable paste more",
    keybinding: {
      binding: logseq.settings.KeyboardShortcut_paste,
      mode: "global",
    }
  }, controlUsage)
}


logseq.ready(main).catch(console.error)
