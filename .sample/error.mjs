/**
 *
 * @type {import('aws-lambda').APIGatewayProxyHandler}
 */
export const handler = async (event) => {
  console.log('error', event);

  throw new Error('called error.mjs');
};
