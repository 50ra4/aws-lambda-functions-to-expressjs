const path = 'foo/id';

/**
 *
 * @type {import('aws-lambda').APIGatewayProxyHandler}
 */
export const handler = async (event) => {
  console.log(`called ${path}.`, event);
  return { status: 200, message: `called ${path}.` };
};
