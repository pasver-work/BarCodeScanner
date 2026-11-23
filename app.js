let artikelen = [];
let scanner = null;
let huidigArtikel = null;

// =====================================
// ARTIKELEN LADEN
// =====================================

async function laadArtikelen() {

    try {

        const response =
            await fetch(
                "Artikelen/ArtikelenApp.csv"
            );

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
                    kolommen[2]?.trim() || "",

                eanHE:
                    kolommen[3]?.trim() || "",

                leverancier:
                    kolommen[4]?.trim() || "",

                vmi:
                    kolommen[5]?.trim() || ""

            });

        }

        console.log(
            artikelen.length +
            " artikelen geladen"
        );

    }
    catch (error) {

        console.error(
            "Fout bij laden artikelen:",
            error
        );

    }

}

// =====================================
// ARTIKEL ZOEKEN
// =====================================

function zoekArtikel() {

    const barcode =

        document
        .getElementById("barcode")
        .value
        .trim();

    console.log(
        "Barcode gezocht:",
        barcode
    );

    const artikel =

        artikelen.find(a =>

            a.eanCE === barcode ||

            a.eanHE === barcode

        );

    if (!artikel) {

        huidigArtikel = null;

        document
            .getElementById("resultaat")
            .innerHTML =

`
<div class="card">

<h2>Artikel niet gevonden</h2>

<p>
Barcode:
${barcode}
</p>

</div>
`;

        return;
    }

    huidigArtikel = artikel;

    document
        .getElementById("resultaat")
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
<option>4892 Jumbo Rosmnalen</option>
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

    let aantal =
        parseInt(
            element.innerText
        );

    aantal++;

    element.innerText =
        aantal;
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

    if (huidigArtikel === null) {

        alert(
            "Scan eerst een artikel."
        );

        return;
    }

    const datumTijd =
        new Date().toLocaleString(
            "nl-NL"
        );

    const aantal =
        document
        .getElementById("aantal")
        .innerText;

    const source =
        document
        .getElementById("source")
        .value;

    const action =
        document
        .getElementById("action")
        .value;

    const melding =

`Datum en tijd: ${datumTijd}

Artikel: ${huidigArtikel.artikel}

Omschrijving: ${huidigArtikel.omschrijving}

Aantal: ${aantal}

Action: ${action}

Source: ${source}

VMI: ${huidigArtikel.vmi}`;

    alert(melding);

    console.log(melding);

    document
        .getElementById(
            "barcode"
        )
        .value = "";

    document
        .getElementById(
            "resultaat"
        )
        .innerHTML = "";

    huidigArtikel = null;

    if (scanner) {

        scanner.resume();

    }

}

// =====================================
// CAMERA
// =====================================

async function startScanner() {

    try {

        const cameras =
            await Html5Qrcode.getCameras();

        console.log(
            "Beschikbare camera's:",
            cameras
        );

        let cameraId = null;

        const achterCamera =
            cameras.find(camera => {

                const naam =
                    camera.label.toLowerCase();

                return (
                    naam.includes("back") ||
                    naam.includes("rear") ||
                    naam.includes("environment")
                );

            });

        if (achterCamera) {

            cameraId =
                achterCamera.id;

            console.log(
                "Achtercamera gevonden:",
                achterCamera.label
            );

        }
        else {

            cameraId =
                cameras[cameras.length - 1].id;

            console.log(
                "Laatste camera gebruikt"
            );

        }

        scanner =
            new Html5Qrcode(
                "reader"
            );

        await scanner.start(

            cameraId,

            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },

            (barcode) => {

                scanner.pause(true);

                console.log(
                    "Gescand:",
                    barcode
                );

                document
                    .getElementById(
                        "barcode"
                    )
                    .value = barcode;

                zoekArtikel();

            },

            () => {
                // geen actie nodig
            }

        );

    }
    catch (error) {

        console.error(
            "Scanner fout:",
            error
        );

    }

}

// =====================================
// START APP
// =====================================

window.onload = async () => {

    await laadArtikelen();

    startScanner();

};
