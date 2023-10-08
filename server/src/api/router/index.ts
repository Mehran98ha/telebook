import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import { notify } from '../../infra/utils/notify/index.js';
import Config from '../../config.js';

/**
 * Router options. Our custom plus Fastify's.
 */
interface RouterOptions extends FastifyServerOptions {
  /**
   * Application config instance
   */
  config: typeof Config
}

/**
 * All routes handlers are defined as a Fastify plugin.
 *
 * @see https://www.fastify.io/docs/latest/Plugins/
 *
 * @param fastify - Fastify instance
 * @param opts - Server options
 */
export default async function router(fastify: FastifyInstance, opts: RouterOptions) {
  // fastify.get('*', async (request: FastifyRequest, reply: FastifyReply) => {
  //   console.log(`Got ${request.method} request to ${request.url} from ${request.ip}`)

  //   return { hello: 'world' }
  // })

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply
      .send({
        message: 'Telebook API is ready',
      });
  })

  fastify.post('/createInvoice', async (request: FastifyRequest, reply: FastifyReply) => {

    console.log(`Got ${request.method} request to ${request.url} from ${request.ip}`)

    const {
      title,
      description,
      prices,
      need_name,
      photo_url,
      photo_size,
      photo_width,
      photo_height,
    } = request.body as any;

    console.log('body', request.body);

    const payload = 'Order #' + Math.random().toString(36).substring(7);

    notify(`🛍️ Create Invoice:  \n\n **${payload}: ${title} ${description}`);


    try {
      // @ts-ignore — 'createInvoiceLink supported by the library, but does not defined in types
      const invoiceLink = await this.bot.createInvoiceLink(title, description, payload, this.config.providerToken, 'USD', prices, {
        need_name,
        photo_url,
        photo_size,
        photo_width,
        photo_height,
      })

      notify(`🛍️ Create Invoice: Success ${invoiceLink} `)

      return reply
        .send({
          invoiceLink
        });
    } catch (e) {
      console.log('error', (e as Error).message);

      notify(`Failed to create invoice: ${(e as Error).message}`)

      reply
        .code(500)
        .send({
          message: (e as Error).message,
        });
    }
  })
}
