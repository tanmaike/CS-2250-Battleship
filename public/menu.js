const quoteList = [
    {
        num: 1,
        q: "The fruits of victory are tumbling into our mouths too quickly.",
        name: "Emperor Hirohito, Japan"
    },
    {
        num: 2,
        q: "Loose Lips Sink Ships!",
        name: "Wartime propaganda slogan"
    },
    {
        num: 3,
        q: "No fighter ever won his fight by covering up-by merely fending off the other fellow's blows. The winner hits and keeps on hitting even though he has to take some stiff blows in order to be able to keep on hitting.",
        name: "Ernest J. King, United States"
    },
    {
        num: 4,
        q: "Leadership consists of picking good men and helping them do their best for you. The attributes of loyalty, discipline and devotion to duty on the part of subordinates must be matched by patience, tolerance and understanding on the part of superiors.",
        name: "Charles H. Nimitz, United States"
    }
]

document.addEventListener('DOMContentLoaded', () => {
    const htmlQP = document.getElementById('quoteText');
    const htmlAP = document.getElementById('quoteAuthor');

    const randomQuote = Math.floor(Math.random() * 4) + 1;
    for (i = 0; i < 5; i++) {
        if (quoteList[i].num === randomQuote) {
            let quotePara = quoteList[i].q;
            let quoteAuth = quoteList[i].name;
            htmlQP.textContent = "\"" + quotePara + "\"";
            htmlAP.textContent = "- " + quoteAuth;
            break;
        }
    }

})