let artikelen = [];
let huidigArtikel = null;

// =====================================
// HULPFUNCTIES
// =====================================

function normaliseerBarcode(barcode) {

    return String(barcode || "")
        .replace(/\s/g, "")
        .trim();

}

// =====================================
// ARTIKELEN LADEN
// =====================================

async function laadArtikelen() {

    try {

        const response =
            await fetch("ArtikelenApp.csv");

        const csv =
            await response.text();

        const regels =
            csv.split(/\r?\n/);

        for (let i = 1; i < regels.length; i++) {

            if (!regels[i].trim()) {
                continue;
            }

            const kolommen =
                regels[i].split("|");

            artikelen.push({

                artikel:
                    kolommen[0]?.trim() || "",

                omschrijving:
                    kolommen[1]?.trim() || "",

                eanCE:
                    normaliseerBarcode(
                        kolommen[2]
                    ),

                eanHE:
                    normaliseerBarcode(
                        kolommen[3]
                    ),

                leverancier:
                    kolommen[4]?.trim() || "",

                vmi:
                    kolommen[5]?.trim() || ""

            });

        }

        console.log(
            "Artikelen geladen:",
            artikelen.length
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

// =====================================
// ZOEK ARTIKEL
// =====================================

function zoekArtikel(barcode) {

    const zoekwaarde =
        normaliseerBarcode(
            barcode
        );

    console.log(
        "Barcode:",
        zoekwaarde
    );

    const artikel =

        artikelen.find(a =>

            a.eanCE === zoekwaarde ||

            a.eanHE === zoekwaarde

        );

    console.log(
        "Artikel gevonden:",
        artikel
    );

    if (!artikel) {

        huidigArtikel = null;

        document
            .getElementById(
                "resultaat"
            )
            .innerHTML =

`
<div class="card">

<h2>Artikel niet gevonden</h2>

<p>
Barcode:
${zoekwaarde}
</p>

</div>
`;

        return;

    }

    huidigArtikel = artikel;

    document
        .getElementById(
            "resultaat"
        )
        .innerHTML =

`
<div class="card">

<h2>Artikel Details</h2>

<p>
<b>Artikel:</b>
${artikel.artikel}
</p>

<p>
<b>Omschrijving:</b>
${artikel.omschrijving}
</p>

<p>
<b>Leverancier:</b>
${artikel.leverancier}
</p>

<p>
<b>VMI:</b>
${artikel.vmi}
</p>

<hr>

<div class="aantal-container">

<button
class="aantal-knop"
onclick="verlaagAantal()">

-

</button>

<span
id="aantal"
class="aantal-waarde">

1

</span>

<button
class="aantal-knop"
onclick="verhoogAantal()">

+

</button>

</div>

<br>

<label>
Source
</label>

<select id="source">

<option>WRAPPERS</option>
<option>COM DOWNSTAIRS</option>
<option>COM UPSTAIRS</option>
<option>OTHER</option>

</select>

<br><br>

<label>
Action
</label>

<select id="action">

<option>Feed in again</option>
<option>Garbagebin</option>
<option>Canteen</option>
<option>3114 Jumbo Schijndel</option>
<option>3127 Jumbo Eindhoven WC Woensel</option>
<option>4608 Jumbo Uden Drossaard</option>
<option>4834 Nieuw Bergen</option>
<option>4848 Jumbo Den Bosch Rompertpassage</option>
<option>4864 Jumbo Heeswijk Dinther</option>
<option>4892 Jumbo Rosmalen</option>
<option>4897 Jumbo Schijndel Rooiseheide</option>
<option>4909 Uden Muziekplein</option>
<option>4989 Jumbo Parkstraat Nistelrode</option>
<option>50587 Jumbo Helmond</option>
<option>5127 Jumbo Sint-Oedenrode</option>
<option>5135 Jumbo Valkenswaard Leenderweg</option>
<option>5137 Jumbo Veghel Stationsstraat</option>

</select>

<br><br>

<button
class="send-button"
onclick="verstuurMelding()">

Verstuur

</button>

</div>
`;

}

// =====================================
// AANTAL
// =====================================

function verhoogAantal() {

    const element =
        document.getElementById(
            "aantal"
        );

    element.innerText =
        parseInt(
            element.innerText
        ) + 1;

}

function verlaagAantal() {

    const element =
        document.getElementById(
            "aantal"
        );

    let aantal =
        parseInt(
            element.innerText
        );

    if (aantal > 1) {

        aantal--;

    }

    element.innerText =
        aantal;

}

// =====================================
// VERSTUREN
// =====================================

function verstuurMelding() {

    if (!huidigArtikel) {

        alert(
            "Scan eerst een artikel"
        );

        return;

    }

    const datumTijd =
        new Date()
        .toLocaleString(
            "nl-NL"
        );

    const aantal =
        document
        .getElementById(
            "aantal"
        )
        .innerText;

    const source =
        document
        .getElementById(
            "source"
        )
        .value;

    const action =
        document
        .getElementById(
            "action"
        )
        .value;

    alert(

`Datum en tijd: ${datumTijd}

Artikel: ${huidigArtikel.artikel}

Omschrijving: ${huidigArtikel.omschrijving}

Aantal: ${aantal}

Action: ${action}

Source: ${source}

VMI: ${huidigArtikel.vmi}`

    );

    document
        .getElementById(
            "resultaat"
        )
        .innerHTML = "";

    huidigArtikel = null;

}

// =====================================
// SCANNER
// =====================================

function startScanner() {

    const scanner =
        new Html5QrcodeScanner(

            "reader",

            {
                fps: 10,
                qrbox: 250,
                rememberLastUsedCamera: true
            },

            false

        );

    scanner.render(

        (barcode) => {

            console.log(
                "Gescand:",
                barcode
            );

            zoekArtikel(
                barcode
            );

        },

        () => {}

    );

}

// =====================================
// APP START
// =====================================

window.onload = async () => {

    await laadArtikelen();

    startScanner();

};
