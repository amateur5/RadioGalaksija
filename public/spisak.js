window.onload = function () {
    const dugme = document.getElementById('spisak');
    const tabela = document.getElementById('tabela');

    dugme.addEventListener('click', () => {
        tabela.style.display = tabela.style.display === 'none' ? 'block' : 'none';
    });

    tabela.style.cssText = `
        position: fixed;
         z-index: 9999;
        bottom: 0;
        left: 0;
        width: 300px;
        height: 600px;
        background: black;
        border: 2px solid;
        border-image: linear-gradient(to right, green, blue, yellow, red) 1;
        padding: 10px;
        overflow-y: auto;
        display: none;
    `;

    for (let i = 0; i < 10; i++) {
        const red = document.createElement('div');
        red.style.cssText = `
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid;
            border-image: linear-gradient(to right, green, blue, yellow, red) 1;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Upiši tekst ${i + 1}`;
        input.style.cssText = `
            width: 100%;
            background: black;
            color: transparent;
            font-weight: bold;
            font-style: italic;
            background-clip: text;
            -webkit-background-clip: text;
            background-image: linear-gradient(to right, green, blue, yellow, red);
            border: none;
            outline: none;
        `;

        red.appendChild(input);
        tabela.appendChild(red);
    }
}
