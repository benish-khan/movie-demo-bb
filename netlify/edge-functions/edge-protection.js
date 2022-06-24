export default async (request, context) => {
  const geoAllowList = JSON.parse(Deno.env.get("GEO_ALLOW_LIST"));
  const ipAllowList = JSON.parse(Deno.env.get("IP_ALLOW_LIST"));

  const geoCode = context.geo?.country?.code;
  const ip = context.ip;

  console.log(typeof geoAllowList);

  // Uses https://www.ipqualityscore.com/documentation/proxy-detection/overview

  const ipCheck = await (
    await fetch(
      `https://ipqualityscore.com/api/json/ip/abvO9dUu9Ej84y2TOG0UpWwHJtYfwnFI/${ip}?strictness=1&allow_public_access_points=true`
    )
  ).json();

  const correctGeo = geoAllowList.includes(geoCode);
  const correctIp = ipAllowList.includes(ip);
  const lowFraudScore = ipCheck.fraud_score < 50;

  if (correctGeo && lowFraudScore && correctIp) {
    context.log(
      `Access Granted - IP Address ${ip} is allowed from ${geoCode}.Fraud score = ${ipCheck.fraud_score}`
    );
    return context.next();
  } else {
    let errors = [];
    !correctGeo
      ? errors.push(` Accessing site from blocked location: ${geoCode}`)
      : "";
    !correctIp ? errors.push(` IP address not on allowed list: ${ip}`) : "";
    !lowFraudScore
      ? errors.push(
          ` Accessing site from IP with high fraud score (${ipCheck.fraud_score}), suspected VPN`
        )
      : "";
    context.log(`Access Denied -${errors.toString()}`);
    return context.rewrite("/access-denied");
  }
};
