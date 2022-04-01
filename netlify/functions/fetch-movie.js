const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
exports.handler = async (event) => {
  const { movieId } = event.queryStringParameters;
  const endpoint = `${process.env.API_URL}movie/${movieId}?api_key=${process.env.API_KEY}`;

  let res = await (await fetch(endpoint)).json();

  return { statusCode: 200, body: JSON.stringify(res) };
};
