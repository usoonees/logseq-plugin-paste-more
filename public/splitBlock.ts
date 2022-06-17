import { IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";

const isEmptyLine = (str: string) => /^\s*$/.test(str);

export function splitBlock(blockContent: string, indentHeaders: boolean) {
  const linesSource = blockContent.split(/\n/).filter((line) => !isEmptyLine(line));
  if (linesSource.length === 1) {
    return [];
  }

  let lines: string[] = []; // join ```, and table
  let i: number = 0;
  while(i < linesSource.length){
    const line = linesSource[i];

    if(line.trim().startsWith("```")) {
      let codeLines: string[] = [line];
      i++;

      while(i < linesSource.length && !linesSource[i].trim().startsWith("```")) {
        codeLines.push("  "+linesSource[i]);
        i++;
      }

      if(i<linesSource.length) {
        codeLines.push(linesSource[i]);
        lines.push(codeLines.join("\n"));
        i++;
      }

    } else if (line.trim().startsWith("|")) {
      let tableLines: string[] = [line];
      i++;

      while(i < linesSource.length && linesSource[i].trim().startsWith("|")) {
        tableLines.push(linesSource[i]);
        i++;
      }
      lines.push(tableLines.join("\n"));
      
    } else {
      lines.push(line);
      i++;
    }
  }

  if (lines.length === 1) {
    return []
  }

  const batchBlock: IBatchBlock[] = [];
  const stack: {
    indent: number;
    block: IBatchBlock;
    parent?: IBatchBlock;
  }[] = [];

  lines.forEach((l) => {
    const content = l.trimStart();

    let indent: number;
    if(content.startsWith("#")) {
      if(indentHeaders) {
        indent = -6;
        for(let i=0;i<content.length;i++) {
          if(content[i] === "#") {
            indent++;
          } else {
            break;
          }
        }
      } else {
        indent = 0;
      }
    } else {
      indent = l.length - content.length;
    }

    const nextBlock: IBatchBlock = {
      content,
      children: [],
    };

    if (!stack.length) {
      batchBlock.push(nextBlock);
      stack.push({
        indent,
        block: nextBlock,
      });
      return;
    }

    let top = stack[stack.length - 1];
    const indentDiff = indent - top.indent;

    if (indentDiff === 0) {
      // 同级，加入父节点的 children
      if (top.parent) {
        top.parent.children!.push(nextBlock);
      } else {
        batchBlock.push(nextBlock);
      }
      top.block = nextBlock;
    } else if (indentDiff > 0) {
      // 缩进
      top.block.children!.push(nextBlock);
      stack.push({
        indent,
        block: nextBlock,
        parent: top.block,
      });
    } else if (indentDiff < 0) {
      // 反缩进
      // 找到同一级别的 block 的 parent block
      while (top.indent > indent) {
        stack.pop();
        if (stack.length === 0) {
          batchBlock.push(nextBlock);
          stack.push({
            indent,
            block: nextBlock,
          });
          return;
        }
        top = stack[stack.length - 1];
      }

      if (top.indent === indent) {
        if (top.parent) {
          top.parent.children!.push(nextBlock);
        } else {
          batchBlock.push(nextBlock);
        }
        top.block = nextBlock;
      } else {
        // 缩进没对齐的情况
        top.block.children.push(nextBlock);
        stack.push({
          indent,
          block: nextBlock,
          parent: top.block,
        });
      }
    }
  });

  return batchBlock;
}