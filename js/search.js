
async function searchUser() {
    const msg = document.getElementById("msg")
    const search = document.getElementById('searchBox')
    const username = document.getElementById('username')

    let request = await MakeAPIRequest(UserQ(search.value))
    let result = request["data"]["user"][0]

    if (result === undefined) {
        msg.textContent = 'No user named "' + search.value + '"'
        search.value = ''
        return
    }

    username.textContent = search.value
    let transactionsXP = await getTransactions(result, "xp")
    displayXP(transactionsXP)

    let auditsCompletedXP = await getTransactions(result, "up")
    let auditsReceivedXP = await getTransactions(result, "down")
    let divXP = getCompletedProjects(auditsReceivedXP)
    displayAuditsGraph(auditsCompletedXP, auditsReceivedXP)
    displayAuditsTable(auditsCompletedXP)
    displayTasksGraph(divXP)
}

async function getTransactions(result, type) {
    let offset = 0
    let transactions = []

    while (true) {
        let tranRequest = await MakeAPIRequest(TransactionsQ(result.id, type, offset))
        let len = tranRequest["data"]["transaction"].length
        if (len === 0) {
            break
        }

        offset += len
        transactions.push(...tranRequest["data"]["transaction"])
    }

    return transactions
}

function displayXP(transactions) {
    const go = document.getElementById('go-piscine-xp')
    const js = document.getElementById('js-piscine-xp')
    const div = document.getElementById('div-01-xp')

    const types = ["piscine-go", "piscine-js", "div-01"]
    let xp = [0,0,0]
    let divXP = {}
    for (const tran of transactions) {
        const path = tran['path']
        const name = tran.object.name

        if (path.includes(types[0])) {
            xp[0] += tran.amount
        } else if (path.includes(types[1])) {
            xp[1] += tran.amount
        } else if (path.includes(types[2])) {
            let exists = Object.keys(divXP).includes(name)
            if (exists) {
                if (tran.amount > divXP[name]) {
                    divXP[name] = tran.amount
                }
            } else {
                divXP[name] = tran.amount
            }
        }
    }
    xp[2] = Object.values(divXP).reduce((partialSum, a) => partialSum + a, 0)
    go.textContent = Math.round(xp[0]).toString()
    js.textContent = Math.round(xp[1]).toString()
    div.textContent = Math.round(xp[2]).toString()
}

function displayAuditsGraph(completed, received) {
    let receivedSum = 0
    let completedSum = 0

    for (const down of received) {
        receivedSum += down.amount
    }
    for (const up of completed) {
        completedSum += up.amount
    }

    const element = document.getElementById('audit-ratio')
    element.innerHTML = ''
    let data = {
        header: ["Name", "XP"],
        rows: [
            ["Received", Math.round(receivedSum)],
            ["Completed", Math.round(completedSum)],
        ]};

    // create the chart
    let chart = anychart.bar();

    // add data
    chart.data(data);

    // set the chart title
    chart.title("Audit ratio");


    // draw
    chart.container("audit-ratio");
    chart.draw();
    removeElementsByClass('anychart-credits')
/*
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', `${60}px`);
    svg.setAttribute('width', `${450}px`);
    svg.setAttribute('viewBox', `0 0 60 450`);

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', 0);
    bar.setAttribute('y', 500);
    bar.setAttribute('height', `${0}px`);
    bar.setAttribute('width', `${500 / data.length}px`);
    bar.setAttribute('style', 'transition: 0.5s all;');
    svg.appendChild(bar);

 */
}

function displayAuditsTable(completed) {

    const table = document.getElementById('user-audits-table')

    for (const audit of completed) {
        const date = (new Date(audit.createdAt)).toDateString()
        table.innerHTML += `<tr>
                            <td>${audit.object.name}</td>
                            <td>${date}</td>
                            <td>${audit.amount}</td>
                        </tr>`
    }


}

function displayTasksGraph(divXP) {
    const element = document.getElementById('tasks')
    element.innerHTML = ''

    let data = {
        header: ["Name", "XP"],
        rows: Object.entries(divXP),
    };

    // create the chart
    let chart = anychart.bar();

    // add data
    chart.data(data);

    // set the chart title
    chart.title("Completed projects");

    // draw
    chart.container("tasks");
    chart.draw();
    removeElementsByClass('anychart-credits')

}

function getCompletedProjects(received) {
    let divXP = {}

    for (const tran of received) {
        const name = tran.object.name
        let exists = Object.keys(divXP).includes(name)
        if (exists) {
            if (tran.amount > divXP[name]) {
                divXP[name] = tran.amount
            }
        } else {
            divXP[name] = tran.amount
        }
    }
    return divXP
}

function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}