const test1 =
  "# header 1\r\nnormal text\r\n## header 2\r\nnormal text\r\n### header 3\r\nnormal text\r\n#### header 4\r\nnormal text\r\n##### header 5\r\nnormal text\r\n###### header 6\r\n\r\nnormal text\r\n\r\n**bold text** normal text **bold text** some text before ** blabla\r\nnormal text\r\n\r\n[Link text](https://app.bugsnag.com/link-address)\r\n\r\nnormal text\r\n_italic text_\r\n\r\n> quote text\r\n\r\n`single line of code`\r\n\r\n```\r\nmultiline code\r\nmultiline code\r\nmultiline code\r\n```\r\n\r\nnormal text\r\n\r\n- list item 1\r\n- list item 2\r\n- list item 3\r\n- list item 4\r\n\r\n1. ordered list item 1\r\n2. ordered list item 2\r\n3. ordered list item 3"
console.log(convertMarkdown(test1))

export function convertMarkdown(content: string): string {
  const blocks = content.split("\r\n")
  const processed: string[] = []
  const convertors = [
    convertHeaders,
    convertBoldText,
    convertUnorderedLists,
    convertLinkedTexts,
  ]

  for (let block of blocks) {
    for (let convertor of convertors) {
      block = convertor(block)
    }
    processed.push(block)
  }

  return processed.join("\r\n")
}

function convertHeaders(block: string): string {
  const regex = new RegExp(/#{1,6}\s/)
  if (regex.test(block)) {
    block = block.replace(regex, "*")
    block += "*"
  }
  return block
}

function convertBoldText(block: string): string {
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

function convertUnorderedLists(block: string): string {
  if (block.startsWith("- ")) {
    block = block.replace("-", "•")
  }
  return block
}

function convertLinkedTexts(block: string): string {
  const regex = /\[(.*?)\]\((.*?)\)/g
  block = block.replace(regex, "<$2|$1>")
  return block
}
