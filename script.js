const { PDFDocument, rgb, StandardFonts } = PDFLib;

// Mapeamento de números para nomes de departamentos
const departamentos = {
    '1': 'Tecnologia_da_informacao',
    '2': 'Recursos_Humanos',
    '3': 'Contabilidade',
    '4': 'Contas_a_Receber',
    '5': 'Contas_a_Pagar',
    '6': 'Comercial',
    '7': 'Estoque',
    '8': 'Oficina',
    '9': 'Reconferencia',
    '10': 'Balcao_de_Vendas',
    '11': 'Producao',
    '12': 'Diretoria',
    '13': 'TST'
};

async function modifyPdf() {
    // Obter os valores do formulário
    const nome = document.getElementById('nomes').value;
    const departamentoNumero = document.getElementById('departamento').value;
    
    if (!nome || !departamentoNumero) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Obter o nome do departamento a partir do número
    const nomeDepartamento = departamentos[departamentoNumero];
    
    // Carregar o PDF correspondente ao departamento selecionado
    const url = `./assets/placa_${departamentoNumero}.pdf`;
    
    try {
        const existingPdfBytes = await fetch(url).then(res => {
            if (!res.ok) throw new Error('PDF não encontrado');
            return res.arrayBuffer();
        });

        // Carregar o PDFDocument
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Incorporar a fonte Helvetica-Bold
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Calcular a largura do texto para centralização
        const textWidth = helveticaBold.widthOfTextAtSize(nome, 32);
        const centerX = (width - textWidth) / 2;

        // Inserir o nome no PDF (centralizado horizontalmente e na posição Y desejada)
        firstPage.drawText(nome, {
            x: centerX,
            y: height - 390,
            size: 32,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

        // Serializar e fazer download com o nome do departamento
        const pdfBytes = await pdfDoc.save();
        download(pdfBytes, `placa_${nomeDepartamento}.pdf`, "application/pdf");
        
    } catch (error) {
        console.error('Erro ao gerar a placa:', error);
        alert('Erro ao gerar a placa. Verifique se o PDF do departamento existe.');
    }
}