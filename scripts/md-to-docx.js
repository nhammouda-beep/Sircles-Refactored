/**
 * Convert BEFORE_AFTER.md into a Word .docx with proper headings, tables,
 * and emphasis. Run with: node scripts/md-to-docx.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  AlignmentType,
  BorderStyle,
} = require('docx');

const SRC = path.join(__dirname, '..', 'BEFORE_AFTER.md');
const DEST = path.join(__dirname, '..', 'Sircles_Before_After.docx');

const md = fs.readFileSync(SRC, 'utf8');

// ---------- Markdown → docx primitives ----------

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function parseInline(text) {
  // Handle **bold**, `code`, and plain text
  const runs = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|[^*`]+)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const seg = match[0];
    if (seg.startsWith('**')) {
      runs.push(new TextRun({ text: seg.slice(2, -2), bold: true }));
    } else if (seg.startsWith('`')) {
      runs.push(new TextRun({ text: seg.slice(1, -1), font: 'Consolas' }));
    } else {
      runs.push(new TextRun({ text: seg }));
    }
  }
  return runs.length ? runs : [new TextRun({ text })];
}

function makeTable(headerCells, bodyRows) {
  const header = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (txt) =>
        new TableCell({
          borders: CELL_BORDERS,
          shading: { fill: 'E5E7EB' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: txt.trim(), bold: true })],
            }),
          ],
        })
    ),
  });

  const rows = [header];
  for (const cells of bodyRows) {
    rows.push(
      new TableRow({
        children: cells.map(
          (cellText) =>
            new TableCell({
              borders: CELL_BORDERS,
              children: [
                new Paragraph({
                  children: parseInline(cellText.trim()),
                }),
              ],
            })
        ),
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

// ---------- Walk the markdown line by line ----------

const lines = md.split(/\r?\n/);
const children = [];
let i = 0;

while (i < lines.length) {
  let line = lines[i];

  // Skip blank lines
  if (!line.trim()) {
    i++;
    continue;
  }

  // Headings
  let m;
  if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
    const level = m[1].length;
    const text = m[2];
    children.push(
      new Paragraph({
        heading:
          level === 1
            ? HeadingLevel.HEADING_1
            : level === 2
            ? HeadingLevel.HEADING_2
            : level === 3
            ? HeadingLevel.HEADING_3
            : HeadingLevel.HEADING_4,
        children: [new TextRun({ text, bold: true })],
        spacing: { before: 240, after: 120 },
      })
    );
    i++;
    continue;
  }

  // Tables: a header line `| col | col |` followed by `| --- | --- |`
  if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|[\s-:|]+\|/)) {
    const parseRow = (raw) =>
      raw
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());

    const headerCells = parseRow(line);
    const bodyRows = [];
    i += 2; // skip separator
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      bodyRows.push(parseRow(lines[i]));
      i++;
    }
    children.push(makeTable(headerCells, bodyRows));
    // small spacer
    children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
    continue;
  }

  // Plain paragraph (handles inline ** and `)
  children.push(
    new Paragraph({
      children: parseInline(line),
      spacing: { after: 80 },
    })
  );
  i++;
}

// ---------- Assemble document ----------

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 }, // 11pt
      },
    },
  },
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(DEST, buf);
  console.log('Wrote', DEST);
});
