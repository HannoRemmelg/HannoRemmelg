let MakeAPIRequest = async (query) => {
    try {
        const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: query
            })
        });
        const data = response.json();
        return data
    } catch (error) {
        return error
    }
}
