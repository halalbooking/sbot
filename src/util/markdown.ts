export function convertMarkdown(content: string): string {
  const blocks = content.split("\r\n")
  const processed: string[] = []
  const converters = [
    convertItalicText,
    convertHeaders,
    convertBoldText,
    convertUnorderedLists,
    convertLinkedTexts,
    convertMultilineCode,
  ]

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i]
    const prev = blocks[i - 1] ?? ""
    const next = blocks[i + 1] ?? ""
    for (const converter of converters) {
      block = converter(block, prev, next)
    }
    processed.push(block)
  }

  return processed.join("\r\n")
}

function convertHeaders(block: string, _: string, __: string): string {
  const regex = new RegExp(/^#{1,6}\s/)
  if (regex.test(block)) {
    block = block.replace(regex, "*")
    block += "*"
  }
  return block
}

function convertBoldText(block: string, _: string, __: string): string {
  const regex = new RegExp(/\*\*/g)
  const count = block.match(regex)?.length ?? 0

  if (count < 2) return block

  if (count % 2 === 0) {
    block = block.replace(regex, "*")
    return block
  }

  const regexWithoutLastOccurence = new RegExp(/\*\*(?=.*\*\*)/g)
  block = block.replace(regexWithoutLastOccurence, "*")
  return block
}

function convertUnorderedLists(block: string, _: string, __: string): string {
  if (block.startsWith("- ")) {
    block = block.replace("-", "•")
  }
  return block
}

function convertLinkedTexts(block: string, _: string, __: string): string {
  const regex = /\[(.*?)\]\((.*?)\)/g
  block = block.replace(regex, "<$2|$1>")
  return block
}

function convertItalicText(block: string, _: string, __: string): string {
  const regex = /(?<!\*)\*([^*].*?)\*/g
  block = block.replace(regex, "_$1_")
  return block
}

function convertMultilineCode(
  block: string,
  prev: string,
  next: string
): string {
  const regex = /^\s{4}/
  if (!regex.test(block)) return block

  block = block.replace(regex, "")

  if (!regex.test(prev)) {
    block = "```" + block
  }

  if (!regex.test(next)) {
    block += "```"
  }

  return block
}
