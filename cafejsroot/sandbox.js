async function main() {
    let url = 'https://jsonplaceholder.typicode.com/posts/1'
    let response = await fetch(url)
    let data = await response.json()
    console.log(data.title)
}
