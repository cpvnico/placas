const { PDFDocument, rgb, StandardFonts } = PDFLib;

// Função para dividir texto em múltiplas linhas
function splitTextIntoLines(font, text, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

async function modifyPdf() {
    const nome = document.getElementById('nomes').value;
    const departamentoNumero = document.getElementById('departamento').value;
    
    if (!nome || !departamentoNumero) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const url = `./assets/placa_${departamentoNumero}.pdf`;
    
    try {
        const existingPdfBytes = await fetch(url).then(res => {
            if (!res.ok) throw new Error('PDF não encontrado');
            return res.arrayBuffer();
        });

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Configurações de layout
        const fontSize = 32;
        const maxWidth = width - 40; // Largura máxima com margens
        const lineHeight = fontSize * 1.2;
        const startY = height - 390;

        // Dividir o texto em múltiplas linhas
        const lines = splitTextIntoLines(helveticaBold, nome, fontSize, maxWidth);

        // Desenhar cada linha (a primeira linha fica na posição Y fixa)
        lines.forEach((line, index) => {
            const textWidth = helveticaBold.widthOfTextAtSize(line, fontSize);
            const centerX = (width - textWidth) / 2;
            
            firstPage.drawText(line, {
                x: centerX,
                y: startY - (index * lineHeight), // Subtrai para linhas adicionais
                size: fontSize,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytes = await pdfDoc.save();
        download(pdfBytes, `placa_departamento_${departamentoNumero}.pdf`, "application/pdf");
        
    } catch (error) {
        console.error('Erro ao gerar a placa:', error);
        alert('Erro ao gerar a placa. Verifique se o PDF do departamento existe.');
    }
}
