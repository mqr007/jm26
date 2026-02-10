// src/lib/environment.ts
import path from "path";
import fs from "fs-extra";
import minimist from "minimist";
import _ from "lodash";
var cmdArgs = minimist(process.argv.slice(2));
var envVars = process.env;
var Environment = class {
  /** 命令行参数 */
  cmdArgs;
  /** 环境变量 */
  envVars;
  /** 环境名称 */
  env;
  /** 服务名称 */
  name;
  /** 服务地址 */
  host;
  /** 服务端口 */
  port;
  /** 包参数 */
  package;
  constructor(options = {}) {
    const { cmdArgs: cmdArgs2, envVars: envVars2, package: _package } = options;
    this.cmdArgs = cmdArgs2;
    this.envVars = envVars2;
    this.env = _.defaultTo(cmdArgs2.env || envVars2.SERVER_ENV, "dev");
    this.name = cmdArgs2.name || envVars2.SERVER_NAME || void 0;
    this.host = cmdArgs2.host || envVars2.SERVER_HOST || void 0;
    this.port = Number(cmdArgs2.port || envVars2.SERVER_PORT) ? Number(cmdArgs2.port || envVars2.SERVER_PORT) : void 0;
    this.package = _package;
  }
};
var environment_default = new Environment({
  cmdArgs,
  envVars,
  package: JSON.parse(fs.readFileSync(path.join(path.resolve(), "package.json")).toString())
});

// src/lib/configs/service-config.ts
import path3 from "path";
import fs3 from "fs-extra";
import yaml from "yaml";
import _3 from "lodash";

// src/lib/util.ts
import os from "os";
import path2 from "path";
import crypto from "crypto";
import { Readable, Writable } from "stream";
import "colors";
import mime from "mime";
import axios from "axios";
import fs2 from "fs-extra";
import { v1 as uuid } from "uuid";
import { format as dateFormat } from "date-fns";
import CRC32 from "crc-32";
import randomstring from "randomstring";
import _2 from "lodash";
import { CronJob } from "cron";

// src/lib/http-status-codes.ts
var http_status_codes_default = {
  CONTINUE: 100,
  //客户端应当继续发送请求。这个临时响应是用来通知客户端它的部分请求已经被服务器接收，且仍未被拒绝。客户端应当继续发送请求的剩余部分，或者如果请求已经完成，忽略这个响应。服务器必须在请求完成后向客户端发送一个最终响应
  SWITCHING_PROTOCOLS: 101,
  //服务器已经理解了客户端的请求，并将通过Upgrade 消息头通知客户端采用不同的协议来完成这个请求。在发送完这个响应最后的空行后，服务器将会切换到在Upgrade 消息头中定义的那些协议。只有在切换新的协议更有好处的时候才应该采取类似措施。例如，切换到新的HTTP 版本比旧版本更有优势，或者切换到一个实时且同步的协议以传送利用此类特性的资源
  PROCESSING: 102,
  //处理将被继续执行
  OK: 200,
  //请求已成功，请求所希望的响应头或数据体将随此响应返回
  CREATED: 201,
  //请求已经被实现，而且有一个新的资源已经依据请求的需要而建立，且其 URI 已经随Location 头信息返回。假如需要的资源无法及时建立的话，应当返回 '202 Accepted'
  ACCEPTED: 202,
  //服务器已接受请求，但尚未处理。正如它可能被拒绝一样，最终该请求可能会也可能不会被执行。在异步操作的场合下，没有比发送这个状态码更方便的做法了。返回202状态码的响应的目的是允许服务器接受其他过程的请求（例如某个每天只执行一次的基于批处理的操作），而不必让客户端一直保持与服务器的连接直到批处理操作全部完成。在接受请求处理并返回202状态码的响应应当在返回的实体中包含一些指示处理当前状态的信息，以及指向处理状态监视器或状态预测的指针，以便用户能够估计操作是否已经完成
  NON_AUTHORITATIVE_INFO: 203,
  //服务器已成功处理了请求，但返回的实体头部元信息不是在原始服务器上有效的确定集合，而是来自本地或者第三方的拷贝。当前的信息可能是原始版本的子集或者超集。例如，包含资源的元数据可能导致原始服务器知道元信息的超级。使用此状态码不是必须的，而且只有在响应不使用此状态码便会返回200 OK的情况下才是合适的
  NO_CONTENT: 204,
  //服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。响应可能通过实体头部的形式，返回新的或更新后的元信息。如果存在这些头部信息，则应当与所请求的变量相呼应。如果客户端是浏览器的话，那么用户浏览器应保留发送了该请求的页面，而不产生任何文档视图上的变化，即使按照规范新的或更新后的元信息应当被应用到用户浏览器活动视图中的文档。由于204响应被禁止包含任何消息体，因此它始终以消息头后的第一个空行结尾
  RESET_CONTENT: 205,
  //服务器成功处理了请求，且没有返回任何内容。但是与204响应不同，返回此状态码的响应要求请求者重置文档视图。该响应主要是被用于接受用户输入后，立即重置表单，以便用户能够轻松地开始另一次输入。与204响应一样，该响应也被禁止包含任何消息体，且以消息头后的第一个空行结束
  PARTIAL_CONTENT: 206,
  //服务器已经成功处理了部分 GET 请求。类似于FlashGet或者迅雷这类的HTTP下载工具都是使用此类响应实现断点续传或者将一个大文档分解为多个下载段同时下载。该请求必须包含 Range 头信息来指示客户端希望得到的内容范围，并且可能包含 If-Range 来作为请求条件。响应必须包含如下的头部域：Content-Range 用以指示本次响应中返回的内容的范围；如果是Content-Type为multipart/byteranges的多段下载，则每一段multipart中都应包含Content-Range域用以指示本段的内容范围。假如响应中包含Content-Length，那么它的数值必须匹配它返回的内容范围的真实字节数。Date和ETag或Content-Location，假如同样的请求本应该返回200响应。Expires, Cache-Control，和/或 Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了 If-Range 强缓存验证，那么本次响应不应该包含其他实体头；假如本响应的请求使用了 If-Range 弱缓存验证，那么本次响应禁止包含其他实体头；这避免了缓存的实体内容和更新了的实体头信息之间的不一致。否则，本响应就应当包含所有本应该返回200响应中应当返回的所有实体头部域。假如 ETag 或 Latest-Modified 头部不能精确匹配的话，则客户端缓存应禁止将206响应返回的内容与之前任何缓存过的内容组合在一起。任何不支持 Range 以及 Content-Range 头的缓存都禁止缓存206响应返回的内容
  MULTIPLE_STATUS: 207,
  //代表之后的消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码
  MULTIPLE_CHOICES: 300,
  //被请求的资源有一系列可供选择的回馈信息，每个都有自己特定的地址和浏览器驱动的商议信息。用户或浏览器能够自行选择一个首选的地址进行重定向。除非这是一个HEAD请求，否则该响应应当包括一个资源特性及地址的列表的实体，以便用户或浏览器从中选择最合适的重定向地址。这个实体的格式由Content-Type定义的格式所决定。浏览器可能根据响应的格式以及浏览器自身能力，自动作出最合适的选择。当然，RFC 2616规范并没有规定这样的自动选择该如何进行。如果服务器本身已经有了首选的回馈选择，那么在Location中应当指明这个回馈的 URI；浏览器可能会将这个 Location 值作为自动重定向的地址。此外，除非额外指定，否则这个响应也是可缓存的
  MOVED_PERMANENTLY: 301,
  //被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个URI之一。如果可能，拥有链接编辑功能的客户端应当自动把请求的地址修改为从服务器反馈回来的地址。除非额外指定，否则这个响应也是可缓存的。新的永久性的URI应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，因此浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：对于某些使用 HTTP/1.0 协议的浏览器，当它们发送的POST请求得到了一个301响应的话，接下来的重定向请求将会变成GET方式
  FOUND: 302,
  //请求的资源现在临时从不同的URI响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI应当在响应的 Location 域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：虽然RFC 1945和RFC 2068规范不允许客户端在重定向时改变请求的方法，但是很多现存的浏览器将302响应视作为303响应，并且使用GET方式访问在Location中规定的URI，而无视原先请求的方法。状态码303和307被添加了进来，用以明确服务器期待客户端进行何种反应
  SEE_OTHER: 303,
  //对应当前请求的响应可以在另一个URI上被找到，而且客户端应当采用 GET 的方式访问那个资源。这个方法的存在主要是为了允许由脚本激活的POST请求输出重定向到一个新的资源。这个新的 URI 不是原始资源的替代引用。同时，303响应禁止被缓存。当然，第二个请求（重定向）可能被缓存。新的 URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。注意：许多 HTTP/1.1 版以前的浏览器不能正确理解303状态。如果需要考虑与这些浏览器之间的互动，302状态码应该可以胜任，因为大多数的浏览器处理302响应时的方式恰恰就是上述规范要求客户端处理303响应时应当做的
  NOT_MODIFIED: 304,
  //如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码。304响应禁止包含消息体，因此始终以消息头后的第一个空行结尾。该响应必须包含以下的头信息：Date，除非这个服务器没有时钟。假如没有时钟的服务器也遵守这些规则，那么代理服务器以及客户端可以自行将Date字段添加到接收到的响应头中去（正如RFC 2068中规定的一样），缓存机制将会正常工作。ETag或 Content-Location，假如同样的请求本应返回200响应。Expires, Cache-Control，和/或Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了强缓存验证，那么本次响应不应该包含其他实体头；否则（例如，某个带条件的 GET 请求使用了弱缓存验证），本次响应禁止包含其他实体头；这避免了缓存了的实体内容和更新了的实体头信息之间的不一致。假如某个304响应指明了当前某个实体没有缓存，那么缓存系统必须忽视这个响应，并且重复发送不包含限制条件的请求。假如接收到一个要求更新某个缓存条目的304响应，那么缓存系统必须更新整个条目以反映所有在响应中被更新的字段的值
  USE_PROXY: 305,
  //被请求的资源必须通过指定的代理才能被访问。Location域中将给出指定的代理所在的URI信息，接收者需要重复发送一个单独的请求，通过这个代理才能访问相应资源。只有原始服务器才能建立305响应。注意：RFC 2068中没有明确305响应是为了重定向一个单独的请求，而且只能被原始服务器建立。忽视这些限制可能导致严重的安全后果
  UNUSED: 306,
  //在最新版的规范中，306状态码已经不再被使用
  TEMPORARY_REDIRECT: 307,
  //请求的资源现在临时从不同的URI 响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI 的超链接及简短说明。因为部分浏览器不能识别307响应，因此需要添加上述必要信息以便用户能够理解并向新的 URI 发出访问请求。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化
  BAD_REQUEST: 400,
  //1.语义有误，当前请求无法被服务器理解。除非进行修改，否则客户端不应该重复提交这个请求 2.请求参数有误
  UNAUTHORIZED: 401,
  //当前请求需要用户验证。该响应必须包含一个适用于被请求资源的 WWW-Authenticate 信息头用以询问用户信息。客户端可以重复提交一个包含恰当的 Authorization 头信息的请求。如果当前请求已经包含了 Authorization 证书，那么401响应代表着服务器验证已经拒绝了那些证书。如果401响应包含了与前一个响应相同的身份验证询问，且浏览器已经至少尝试了一次验证，那么浏览器应当向用户展示响应中包含的实体信息，因为这个实体信息中可能包含了相关诊断信息。参见RFC 2617
  PAYMENT_REQUIRED: 402,
  //该状态码是为了将来可能的需求而预留的
  FORBIDDEN: 403,
  //服务器已经理解请求，但是拒绝执行它。与401响应不同的是，身份验证并不能提供任何帮助，而且这个请求也不应该被重复提交。如果这不是一个HEAD请求，而且服务器希望能够讲清楚为何请求不能被执行，那么就应该在实体内描述拒绝的原因。当然服务器也可以返回一个404响应，假如它不希望让客户端获得任何信息
  NOT_FOUND: 404,
  //请求失败，请求所希望得到的资源未被在服务器上发现。没有信息能够告诉用户这个状况到底是暂时的还是永久的。假如服务器知道情况的话，应当使用410状态码来告知旧资源因为某些内部的配置机制问题，已经永久的不可用，而且没有任何可以跳转的地址。404这个状态码被广泛应用于当服务器不想揭示到底为何请求被拒绝或者没有其他适合的响应可用的情况下
  METHOD_NOT_ALLOWED: 405,
  //请求行中指定的请求方法不能被用于请求相应的资源。该响应必须返回一个Allow 头信息用以表示出当前资源能够接受的请求方法的列表。鉴于PUT，DELETE方法会对服务器上的资源进行写操作，因而绝大部分的网页服务器都不支持或者在默认配置下不允许上述请求方法，对于此类请求均会返回405错误
  NO_ACCEPTABLE: 406,
  //请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体。除非这是一个 HEAD 请求，否则该响应就应当返回一个包含可以让用户或者浏览器从中选择最合适的实体特性以及地址列表的实体。实体的格式由Content-Type头中定义的媒体类型决定。浏览器可以根据格式及自身能力自行作出最佳选择。但是，规范中并没有定义任何作出此类自动选择的标准
  PROXY_AUTHENTICATION_REQUIRED: 407,
  //与401响应类似，只不过客户端必须在代理服务器上进行身份验证。代理服务器必须返回一个Proxy-Authenticate用以进行身份询问。客户端可以返回一个Proxy-Authorization信息头用以验证。参见RFC 2617
  REQUEST_TIMEOUT: 408,
  //请求超时。客户端没有在服务器预备等待的时间内完成一个请求的发送。客户端可以随时再次提交这一请求而无需进行任何更改
  CONFLICT: 409,
  //由于和被请求的资源的当前状态之间存在冲突，请求无法完成。这个代码只允许用在这样的情况下才能被使用：用户被认为能够解决冲突，并且会重新提交新的请求。该响应应当包含足够的信息以便用户发现冲突的源头。冲突通常发生于对PUT请求的处理中。例如，在采用版本检查的环境下，某次PUT提交的对特定资源的修改请求所附带的版本信息与之前的某个（第三方）请求向冲突，那么此时服务器就应该返回一个409错误，告知用户请求无法完成。此时，响应实体中很可能会包含两个冲突版本之间的差异比较，以便用户重新提交归并以后的新版本
  GONE: 410,
  //被请求的资源在服务器上已经不再可用，而且没有任何已知的转发地址。这样的状况应当被认为是永久性的。如果可能，拥有链接编辑功能的客户端应当在获得用户许可后删除所有指向这个地址的引用。如果服务器不知道或者无法确定这个状况是否是永久的，那么就应该使用404状态码。除非额外说明，否则这个响应是可缓存的。410响应的目的主要是帮助网站管理员维护网站，通知用户该资源已经不再可用，并且服务器拥有者希望所有指向这个资源的远端连接也被删除。这类事件在限时、增值服务中很普遍。同样，410响应也被用于通知客户端在当前服务器站点上，原本属于某个个人的资源已经不再可用。当然，是否需要把所有永久不可用的资源标记为'410 Gone'，以及是否需要保持此标记多长时间，完全取决于服务器拥有者
  LENGTH_REQUIRED: 411,
  //服务器拒绝在没有定义Content-Length头的情况下接受请求。在添加了表明请求消息体长度的有效Content-Length头之后，客户端可以再次提交该请求 
  PRECONDITION_FAILED: 412,
  //服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个。这个状态码允许客户端在获取资源时在请求的元信息（请求头字段数据）中设置先决条件，以此避免该请求方法被应用到其希望的内容以外的资源上
  REQUEST_ENTITY_TOO_LARGE: 413,
  //服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围。此种情况下，服务器可以关闭连接以免客户端继续发送此请求。如果这个状况是临时的，服务器应当返回一个 Retry-After 的响应头，以告知客户端可以在多少时间以后重新尝试
  REQUEST_URI_TOO_LONG: 414,
  //请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。这比较少见，通常的情况包括：本应使用POST方法的表单提交变成了GET方法，导致查询字符串（Query String）过长。重定向URI “黑洞”，例如每次重定向把旧的URI作为新的URI的一部分，导致在若干次重定向后URI超长。客户端正在尝试利用某些服务器中存在的安全漏洞攻击服务器。这类服务器使用固定长度的缓冲读取或操作请求的URI，当GET后的参数超过某个数值后，可能会产生缓冲区溢出，导致任意代码被执行[1]。没有此类漏洞的服务器，应当返回414状态码
  UNSUPPORTED_MEDIA_TYPE: 415,
  //对于当前请求的方法和所请求的资源，请求中提交的实体并不是服务器中所支持的格式，因此请求被拒绝
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  //如果请求中包含了Range请求头，并且Range中指定的任何数据范围都与当前资源的可用范围不重合，同时请求中又没有定义If-Range请求头，那么服务器就应当返回416状态码。假如Range使用的是字节范围，那么这种情况就是指请求指定的所有数据范围的首字节位置都超过了当前资源的长度。服务器也应当在返回416状态码的同时，包含一个Content-Range实体头，用以指明当前资源的长度。这个响应也被禁止使用multipart/byteranges作为其 Content-Type
  EXPECTION_FAILED: 417,
  //在请求头Expect中指定的预期内容无法被服务器满足，或者这个服务器是一个代理服务器，它有明显的证据证明在当前路由的下一个节点上，Expect的内容无法被满足
  TOO_MANY_CONNECTIONS: 421,
  //从当前客户端所在的IP地址到服务器的连接数超过了服务器许可的最大范围。通常，这里的IP地址指的是从服务器上看到的客户端地址（比如用户的网关或者代理服务器地址）。在这种情况下，连接数的计算可能涉及到不止一个终端用户
  UNPROCESSABLE_ENTITY: 422,
  //请求格式正确，但是由于含有语义错误，无法响应
  FAILED_DEPENDENCY: 424,
  //由于之前的某个请求发生的错误，导致当前请求失败，例如PROPPATCH
  UNORDERED_COLLECTION: 425,
  //在WebDav Advanced Collections 草案中定义，但是未出现在《WebDAV 顺序集协议》（RFC 3658）中
  UPGRADE_REQUIRED: 426,
  //客户端应当切换到TLS/1.0
  RETRY_WITH: 449,
  //由微软扩展，代表请求应当在执行完适当的操作后进行重试
  INTERNAL_SERVER_ERROR: 500,
  //服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。一般来说，这个问题都会在服务器的程序码出错时出现
  NOT_IMPLEMENTED: 501,
  //服务器不支持当前请求所需要的某个功能。当服务器无法识别请求的方法，并且无法支持其对任何资源的请求
  BAD_GATEWAY: 502,
  //作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应
  SERVICE_UNAVAILABLE: 503,
  //由于临时的服务器维护或者过载，服务器当前无法处理请求。这个状况是临时的，并且将在一段时间以后恢复。如果能够预计延迟时间，那么响应中可以包含一个 Retry-After 头用以标明这个延迟时间。如果没有给出这个 Retry-After 信息，那么客户端应当以处理500响应的方式处理它。注意：503状态码的存在并不意味着服务器在过载的时候必须使用它。某些服务器只不过是希望拒绝客户端的连接
  GATEWAY_TIMEOUT: 504,
  //作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应。注意：某些代理服务器在DNS查询超时时会返回400或者500错误
  HTTP_VERSION_NOT_SUPPORTED: 505,
  //服务器不支持，或者拒绝支持在请求中使用的HTTP版本。这暗示着服务器不能或不愿使用与客户端相同的版本。响应中应当包含一个描述了为何版本不被支持以及服务器支持哪些协议的实体
  VARIANT_ALSO_NEGOTIATES: 506,
  //服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点
  INSUFFICIENT_STORAGE: 507,
  //服务器无法存储完成请求所必须的内容。这个状况被认为是临时的
  BANDWIDTH_LIMIT_EXCEEDED: 509,
  //服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用
  NOT_EXTENDED: 510
  //获取资源所需要的策略并没有没满足
};

// src/lib/util.ts
var autoIdMap = /* @__PURE__ */ new Map();
var util = {
  is2DArrays(value) {
    return _2.isArray(value) && (!value[0] || _2.isArray(value[0]) && _2.isArray(value[value.length - 1]));
  },
  uuid: (separator = true) => separator ? uuid() : uuid().replace(/\-/g, ""),
  autoId: (prefix = "") => {
    let index = autoIdMap.get(prefix);
    if (index > 999999) index = 0;
    autoIdMap.set(prefix, (index || 0) + 1);
    return `${prefix}${index || 1}`;
  },
  ignoreJSONParse(value) {
    const result = _2.attempt(() => JSON.parse(value));
    if (_2.isError(result)) return null;
    return result;
  },
  generateRandomString(options) {
    return randomstring.generate(options);
  },
  getResponseContentType(value) {
    return value.headers ? value.headers["content-type"] || value.headers["Content-Type"] : null;
  },
  mimeToExtension(value) {
    let extension = mime.getExtension(value);
    if (extension == "mpga") return "mp3";
    return extension;
  },
  extractURLExtension(value) {
    const extname = path2.extname(new URL(value).pathname);
    return extname.substring(1).toLowerCase();
  },
  createCronJob(cronPatterns, callback) {
    if (!_2.isFunction(callback))
      throw new Error("callback must be an Function");
    return new CronJob(
      cronPatterns,
      () => callback(),
      null,
      false,
      "Asia/Shanghai"
    );
  },
  getDateString(format = "yyyy-MM-dd", date = /* @__PURE__ */ new Date()) {
    return dateFormat(date, format);
  },
  getIPAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].address) addresses.push(results[0].address);
    }
    return addresses;
  },
  getMACAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].mac) addresses.push(results[0].mac);
    }
    return addresses;
  },
  generateSSEData(event, data, retry) {
    return `event: ${event || "message"}
data: ${(data || "").replace(/\n/g, "\\n").replace(/\s/g, "\\s")}
retry: ${retry || 3e3}

`;
  },
  buildDataBASE64(type, ext, buffer) {
    return `data:${type}/${ext.replace("jpg", "jpeg")};base64,${buffer.toString(
      "base64"
    )}`;
  },
  isLinux() {
    return os.platform() !== "win32";
  },
  isIPAddress(value) {
    return _2.isString(value) && (/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(
      value
    ) || /\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*/.test(
      value
    ));
  },
  isPort(value) {
    return _2.isNumber(value) && value > 0 && value < 65536;
  },
  isReadStream(value) {
    return value && (value instanceof Readable || "readable" in value || value.readable);
  },
  isWriteStream(value) {
    return value && (value instanceof Writable || "writable" in value || value.writable);
  },
  isHttpStatusCode(value) {
    return _2.isNumber(value) && Object.values(http_status_codes_default).includes(value);
  },
  isURL(value) {
    return !_2.isUndefined(value) && /^(http|https)/.test(value);
  },
  isSrc(value) {
    return !_2.isUndefined(value) && /^\/.+\.[0-9a-zA-Z]+(\?.+)?$/.test(value);
  },
  isBASE64(value) {
    return !_2.isUndefined(value) && /^[a-zA-Z0-9\/\+]+(=?)+$/.test(value);
  },
  isBASE64Data(value) {
    return /^data:/.test(value);
  },
  extractBASE64DataFormat(value) {
    const match = value.trim().match(/^data:(.+);base64,/);
    if (!match) return null;
    return match[1];
  },
  removeBASE64DataHeader(value) {
    return value.replace(/^data:(.+);base64,/, "");
  },
  isDataString(value) {
    return /^(base64|json):/.test(value);
  },
  isStringNumber(value) {
    return _2.isFinite(Number(value));
  },
  isUnixTimestamp(value) {
    return /^[0-9]{10}$/.test(`${value}`);
  },
  isTimestamp(value) {
    return /^[0-9]{13}$/.test(`${value}`);
  },
  isEmail(value) {
    return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(
      value
    );
  },
  isAsyncFunction(value) {
    return Object.prototype.toString.call(value) === "[object AsyncFunction]";
  },
  async isAPNG(filePath) {
    let head;
    const readStream = fs2.createReadStream(filePath, { start: 37, end: 40 });
    const readPromise = new Promise((resolve, reject) => {
      readStream.once("end", resolve);
      readStream.once("error", reject);
    });
    readStream.once("data", (data) => head = data);
    await readPromise;
    return head.compare(Buffer.from([97, 99, 84, 76])) === 0;
  },
  unixTimestamp() {
    return parseInt(`${Date.now() / 1e3}`);
  },
  timestamp() {
    return Date.now();
  },
  urlJoin(...values) {
    let url = "";
    for (let i = 0; i < values.length; i++)
      url += `${i > 0 ? "/" : ""}${values[i].replace(/^\/*/, "").replace(/\/*$/, "")}`;
    return url;
  },
  millisecondsToHmss(milliseconds) {
    if (_2.isString(milliseconds)) return milliseconds;
    milliseconds = parseInt(milliseconds);
    const sec = Math.floor(milliseconds / 1e3);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - hours * 3600) / 60);
    const seconds = sec - hours * 3600 - minutes * 60;
    const ms = milliseconds % 6e4 - seconds * 1e3;
    return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}.${ms}`;
  },
  millisecondsToTimeString(milliseconds) {
    if (milliseconds < 1e3) return `${milliseconds}ms`;
    if (milliseconds < 6e4)
      return `${parseFloat((milliseconds / 1e3).toFixed(2))}s`;
    return `${Math.floor(milliseconds / 1e3 / 60)}m${Math.floor(
      milliseconds / 1e3 % 60
    )}s`;
  },
  rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  hexToRgb(hex) {
    const value = parseInt(hex.replace(/^#/, ""), 16);
    return [value >> 16 & 255, value >> 8 & 255, value & 255];
  },
  md5(value) {
    return crypto.createHash("md5").update(value).digest("hex");
  },
  crc32(value) {
    return _2.isBuffer(value) ? CRC32.buf(value) : CRC32.str(value);
  },
  arrayParse(value) {
    return _2.isArray(value) ? value : [value];
  },
  booleanParse(value) {
    return value === "true" || value === true ? true : false;
  },
  encodeBASE64(value) {
    return Buffer.from(value).toString("base64");
  },
  decodeBASE64(value) {
    return Buffer.from(value, "base64").toString();
  },
  async fetchFileBASE64(url) {
    const result = await axios.get(url, {
      responseType: "arraybuffer"
    });
    return result.data.toString("base64");
  },
  /**
   * 计算 ArrayBuffer 的 CRC32 值
   * @param buffer ArrayBuffer 数据
   * @returns CRC32 十六进制字符串
   */
  calculateCRC32(buffer) {
    const crcTable = [];
    for (let i = 0; i < 256; i++) {
      let crc2 = i;
      for (let j = 0; j < 8; j++) {
        crc2 = crc2 & 1 ? 3988292384 ^ crc2 >>> 1 : crc2 >>> 1;
      }
      crcTable[i] = crc2;
    }
    let crc = 0 ^ -1;
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      crc = crc >>> 8 ^ crcTable[(crc ^ bytes[i]) & 255];
    }
    return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
  }
};
var util_default = util;

// src/lib/configs/service-config.ts
var CONFIG_PATH = path3.join(path3.resolve(), "configs/", environment_default.env, "/service.yml");
var ServiceConfig = class _ServiceConfig {
  /** 服务名称 */
  name;
  /** @type {string} 服务绑定主机地址 */
  host;
  /** @type {number} 服务绑定端口 */
  port;
  /** @type {string} 服务路由前缀 */
  urlPrefix;
  /** @type {string} 服务绑定地址（外部访问地址） */
  bindAddress;
  constructor(options) {
    const { name, host, port, urlPrefix, bindAddress } = options || {};
    this.name = _3.defaultTo(name, "jimeng-api");
    this.host = _3.defaultTo(host, "0.0.0.0");
    this.port = _3.defaultTo(port, 5566);
    this.urlPrefix = _3.defaultTo(urlPrefix, "");
    this.bindAddress = bindAddress;
  }
  get addressHost() {
    if (this.bindAddress) return this.bindAddress;
    const ipAddresses = util_default.getIPAddressesByIPv4();
    for (let ipAddress of ipAddresses) {
      if (ipAddress === this.host)
        return ipAddress;
    }
    return ipAddresses[0] || "127.0.0.1";
  }
  get address() {
    return `${this.addressHost}:${this.port}`;
  }
  get pageDirUrl() {
    return `http://127.0.0.1:${this.port}/page`;
  }
  static load() {
    const external = _3.pickBy(environment_default, (v, k) => ["name", "host", "port"].includes(k) && !_3.isUndefined(v));
    if (!fs3.pathExistsSync(CONFIG_PATH)) return new _ServiceConfig(external);
    const data = yaml.parse(fs3.readFileSync(CONFIG_PATH).toString());
    return new _ServiceConfig({ ...data, ...external });
  }
};
var service_config_default = ServiceConfig.load();

// src/lib/configs/system-config.ts
import path4 from "path";
import fs4 from "fs-extra";
import yaml2 from "yaml";
import _4 from "lodash";
var CONFIG_PATH2 = path4.join(path4.resolve(), "configs/", environment_default.env, "/system.yml");
var SystemConfig = class _SystemConfig {
  /** 是否开启请求日志 */
  requestLog;
  /** 临时目录路径 */
  tmpDir;
  /** 日志目录路径 */
  logDir;
  /** 日志写入间隔（毫秒） */
  logWriteInterval;
  /** 日志文件有效期（毫秒） */
  logFileExpires;
  /** 临时文件有效期（毫秒） */
  tmpFileExpires;
  /** 请求体配置 */
  requestBody;
  /** 是否调试模式 */
  debug;
  /** 日志级别 */
  log_level;
  constructor(options) {
    const { requestLog, tmpDir, logDir, logWriteInterval, logFileExpires, tmpFileExpires, requestBody, debug, log_level } = options || {};
    this.requestLog = _4.defaultTo(requestLog, false);
    this.tmpDir = _4.defaultTo(tmpDir, "./tmp");
    this.logDir = _4.defaultTo(logDir, "./logs");
    this.logWriteInterval = _4.defaultTo(logWriteInterval, 200);
    this.logFileExpires = _4.defaultTo(logFileExpires, 262656e4);
    this.tmpFileExpires = _4.defaultTo(tmpFileExpires, 864e5);
    this.requestBody = Object.assign(requestBody || {}, {
      enableTypes: ["form", "text", "xml"],
      // 移除 json，由自定义中间件处理
      encoding: "utf-8",
      formLimit: "100mb",
      jsonLimit: "100mb",
      textLimit: "100mb",
      xmlLimit: "100mb",
      formidable: {
        maxFileSize: "100mb"
      },
      multipart: true,
      parsedMethods: ["POST", "PUT", "PATCH"]
    });
    this.debug = _4.defaultTo(debug, true);
    this.log_level = _4.defaultTo(log_level, "info");
  }
  get rootDirPath() {
    return path4.resolve();
  }
  get tmpDirPath() {
    return path4.resolve(this.tmpDir);
  }
  get logDirPath() {
    return path4.resolve(this.logDir);
  }
  static load() {
    if (!fs4.pathExistsSync(CONFIG_PATH2)) return new _SystemConfig();
    const data = yaml2.parse(fs4.readFileSync(CONFIG_PATH2).toString());
    return new _SystemConfig(data);
  }
};
var system_config_default = SystemConfig.load();

// src/lib/config.ts
var Config = class {
  /** 服务配置 */
  service = service_config_default;
  /** 系统配置 */
  system = system_config_default;
};
var config_default = new Config();

// src/lib/logger.ts
import path5 from "path";
import _util from "util";
import "colors";
import _5 from "lodash";
import fs5 from "fs-extra";
import { format as dateFormat2 } from "date-fns";
var isVercelEnv = process.env.VERCEL;
var LogWriter = class {
  #buffers = [];
  constructor() {
    !isVercelEnv && fs5.ensureDirSync(config_default.system.logDirPath);
    !isVercelEnv && this.work();
  }
  push(content) {
    const buffer = Buffer.from(content);
    this.#buffers.push(buffer);
  }
  writeSync(buffer) {
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  async write(buffer) {
    !isVercelEnv && await fs5.appendFile(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  flush() {
    if (!this.#buffers.length) return;
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), Buffer.concat(this.#buffers));
  }
  work() {
    if (!this.#buffers.length) return setTimeout(this.work.bind(this), config_default.system.logWriteInterval);
    const buffer = Buffer.concat(this.#buffers);
    this.#buffers = [];
    this.write(buffer).finally(() => setTimeout(this.work.bind(this), config_default.system.logWriteInterval)).catch((err) => console.error("Log write error:", err));
  }
};
var LogText = class {
  /** @type {string} 日志级别 */
  level;
  /** @type {string} 日志文本 */
  text;
  /** @type {string} 日志来源 */
  source;
  /** @type {Date} 日志发生时间 */
  time = /* @__PURE__ */ new Date();
  constructor(level, ...params) {
    this.level = level;
    this.text = _util.format.apply(null, params);
    this.source = this.#getStackTopCodeInfo();
  }
  #getStackTopCodeInfo() {
    const unknownInfo = { name: "unknown", codeLine: 0, codeColumn: 0 };
    const stackArray = new Error().stack.split("\n");
    const text = stackArray[4];
    if (!text)
      return unknownInfo;
    const match = text.match(/at (.+) \((.+)\)/) || text.match(/at (.+)/);
    if (!match || !_5.isString(match[2] || match[1]))
      return unknownInfo;
    const temp = match[2] || match[1];
    const _match = temp.match(/([a-zA-Z0-9_\-\.]+)\:(\d+)\:(\d+)$/);
    if (!_match)
      return unknownInfo;
    const [, scriptPath, codeLine, codeColumn] = _match;
    return {
      name: scriptPath ? scriptPath.replace(/.js$/, "") : "unknown",
      path: scriptPath || null,
      codeLine: parseInt(codeLine || 0),
      codeColumn: parseInt(codeColumn || 0)
    };
  }
  toString() {
    return `[${dateFormat2(this.time, "yyyy-MM-dd HH:mm:ss.SSS")}][${this.level}][${this.source.name}<${this.source.codeLine},${this.source.codeColumn}>] ${this.text}`;
  }
};
var Logger = class _Logger {
  /** @type {Object} 系统配置 */
  config = {};
  /** @type {Object} 日志级别映射 */
  static Level = {
    Info: "info",
    Debug: "debug",
    Warning: "warning",
    Error: "error"
  };
  /** @type {Object} 日志级别文本颜色樱色 */
  static LevelColor = {
    [_Logger.Level.Success]: "green",
    [_Logger.Level.Info]: "brightCyan",
    [_Logger.Level.Debug]: "white",
    [_Logger.Level.Warning]: "brightYellow",
    [_Logger.Level.Error]: "brightRed",
    [_Logger.Level.Fatal]: "red"
  };
  static LevelPriority = {
    [_Logger.Level.Fatal]: 1,
    [_Logger.Level.Error]: 2,
    [_Logger.Level.Warning]: 3,
    [_Logger.Level.Success]: 4,
    [_Logger.Level.Info]: 5,
    [_Logger.Level.Log]: 6,
    [_Logger.Level.Debug]: 7
  };
  #writer;
  constructor() {
    this.#writer = new LogWriter();
  }
  header() {
    this.#writer.writeSync(Buffer.from(`

===================== LOG START ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  footer() {
    this.#writer.flush();
    this.#writer.writeSync(Buffer.from(`

===================== LOG END ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  #checkLevel(level) {
    const currentLevelPriority = _Logger.LevelPriority[config_default.system.log_level] || 99;
    const levelPriority = _Logger.LevelPriority[level];
    return levelPriority <= currentLevelPriority;
  }
  success(...params) {
    if (!this.#checkLevel(_Logger.Level.Success)) return;
    const content = new LogText(_Logger.Level.Success, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Success]]);
    this.#writer.push(content + "\n");
  }
  info(...params) {
    if (!this.#checkLevel(_Logger.Level.Info)) return;
    const content = new LogText(_Logger.Level.Info, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Info]]);
    this.#writer.push(content + "\n");
  }
  debug(...params) {
    if (!config_default.system.debug) return;
    if (!this.#checkLevel(_Logger.Level.Debug)) return;
    const content = new LogText(_Logger.Level.Debug, ...params).toString();
    console.debug(content[_Logger.LevelColor[_Logger.Level.Debug]]);
    this.#writer.push(content + "\n");
  }
  warn(...params) {
    if (!this.#checkLevel(_Logger.Level.Warning)) return;
    const content = new LogText(_Logger.Level.Warning, ...params).toString();
    console.warn(content[_Logger.LevelColor[_Logger.Level.Warning]]);
    this.#writer.push(content + "\n");
  }
  error(...params) {
    if (!this.#checkLevel(_Logger.Level.Error)) return;
    const content = new LogText(_Logger.Level.Error, ...params).toString();
    console.error(content[_Logger.LevelColor[_Logger.Level.Error]]);
    this.#writer.push(content);
  }
  destory() {
    this.#writer.destory();
  }
};
var logger_default = new Logger();

// src/lib/initialize.ts
process.setMaxListeners(Infinity);
process.on("uncaughtException", (err, origin) => {
  logger_default.error(`An unhandled error occurred: ${origin}`, err);
});
process.on("unhandledRejection", (_18, promise) => {
  promise.catch((err) => logger_default.error("An unhandled rejection occurred:", err));
});
process.on("warning", (warning) => logger_default.warn("System warning: ", warning));
process.on("exit", () => {
  logger_default.info("Service exit");
  logger_default.footer();
});
process.on("SIGTERM", () => {
  logger_default.warn("received kill signal");
  process.exit(2);
});
process.on("SIGINT", () => {
  process.exit(0);
});

// src/lib/server.ts
import Koa from "koa";
import KoaRouter from "koa-router";
import koaRange from "koa-range";
import koaCors from "koa2-cors";
import koaBody from "koa-body";
import _11 from "lodash";

// src/lib/request/Request.ts
import _7 from "lodash";

// src/lib/exceptions/Exception.ts
import assert from "assert";
import _6 from "lodash";
var Exception = class extends Error {
  /** 错误码 */
  errcode;
  /** 错误消息 */
  errmsg;
  /** 数据 */
  data;
  /** HTTP状态码 */
  httpStatusCode;
  /**
   * 构造异常
   * 
   * @param exception 异常
   * @param _errmsg 异常消息
   */
  constructor(exception, _errmsg) {
    assert(_6.isArray(exception), "Exception must be Array");
    const [errcode, errmsg] = exception;
    assert(_6.isFinite(errcode), "Exception errcode invalid");
    assert(_6.isString(errmsg), "Exception errmsg invalid");
    super(_errmsg || errmsg);
    this.errcode = errcode;
    this.errmsg = _errmsg || errmsg;
  }
  compare(exception) {
    const [errcode] = exception;
    return this.errcode == errcode;
  }
  setHTTPStatusCode(value) {
    this.httpStatusCode = value;
    return this;
  }
  setData(value) {
    this.data = _6.defaultTo(value, null);
    return this;
  }
};

// src/lib/exceptions/APIException.ts
var APIException = class extends Exception {
  /**
   * 构造异常
   * 
   * @param {[number, string]} exception 异常
   */
  constructor(exception, errmsg) {
    super(exception, errmsg);
  }
};

// src/api/consts/exceptions.ts
var exceptions_default = {
  API_TEST: [-9999, "API\u5F02\u5E38\u9519\u8BEF"],
  API_REQUEST_PARAMS_INVALID: [-2e3, "\u8BF7\u6C42\u53C2\u6570\u975E\u6CD5"],
  API_REQUEST_FAILED: [-2001, "\u8BF7\u6C42\u5931\u8D25"],
  API_TOKEN_EXPIRES: [-2002, "Token\u5DF2\u5931\u6548"],
  API_FILE_URL_INVALID: [-2003, "\u8FDC\u7A0B\u6587\u4EF6URL\u975E\u6CD5"],
  API_FILE_EXECEEDS_SIZE: [-2004, "\u8FDC\u7A0B\u6587\u4EF6\u8D85\u51FA\u5927\u5C0F"],
  API_CHAT_STREAM_PUSHING: [-2005, "\u5DF2\u6709\u5BF9\u8BDD\u6D41\u6B63\u5728\u8F93\u51FA"],
  API_CONTENT_FILTERED: [-2006, "\u5185\u5BB9\u7531\u4E8E\u5408\u89C4\u95EE\u9898\u5DF2\u88AB\u963B\u6B62\u751F\u6210"],
  API_IMAGE_GENERATION_FAILED: [-2007, "\u56FE\u50CF\u751F\u6210\u5931\u8D25"],
  API_VIDEO_GENERATION_FAILED: [-2008, "\u89C6\u9891\u751F\u6210\u5931\u8D25"],
  API_IMAGE_GENERATION_INSUFFICIENT_POINTS: [-2009, "\u5373\u68A6\u79EF\u5206\u4E0D\u8DB3"]
};

// src/lib/request/Request.ts
var Request = class {
  /** 请求方法 */
  method;
  /** 请求URL */
  url;
  /** 请求路径 */
  path;
  /** 请求载荷类型 */
  type;
  /** 请求headers */
  headers;
  /** 请求原始查询字符串 */
  search;
  /** 请求查询参数 */
  query;
  /** 请求URL参数 */
  params;
  /** 请求载荷 */
  body;
  /** 上传的文件 */
  files;
  /** 客户端IP地址 */
  remoteIP;
  /** 请求接受时间戳（毫秒） */
  time;
  constructor(ctx, options = {}) {
    const { time } = options;
    this.method = ctx.request.method;
    this.url = ctx.request.url;
    this.path = ctx.request.path;
    this.type = ctx.request.type;
    this.headers = ctx.request.headers || {};
    this.search = ctx.request.search;
    this.query = ctx.query || {};
    this.params = ctx.params || {};
    this.body = ctx.request.body || {};
    this.files = ctx.request.files || {};
    this.remoteIP = this.headers["X-Real-IP"] || this.headers["x-real-ip"] || this.headers["X-Forwarded-For"] || this.headers["x-forwarded-for"] || ctx.ip || null;
    this.time = Number(_7.defaultTo(time, util_default.timestamp()));
  }
  validate(key, fn, message) {
    try {
      const value = _7.get(this, key);
      logger_default.debug(`Validating ${key}: value =`, value, `type =`, typeof value, `isArray =`, Array.isArray(value));
      if (fn) {
        const result = fn(value);
        logger_default.debug(`Validation function result for ${key}:`, result);
        if (result === false)
          throw `[Mismatch] -> ${fn}`;
      } else if (_7.isUndefined(value))
        throw "[Undefined]";
    } catch (err) {
      logger_default.warn(`Params ${key} invalid:`, err);
      throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, message || `Params ${key} invalid`);
    }
    return this;
  }
};

// src/lib/response/Response.ts
import mime2 from "mime";
import _9 from "lodash";

// src/lib/response/Body.ts
import _8 from "lodash";
var Body = class _Body {
  /** 状态码 */
  code;
  /** 状态消息 */
  message;
  /** 载荷 */
  data;
  /** HTTP状态码 */
  statusCode;
  constructor(options = {}) {
    const { code, message, data, statusCode } = options;
    this.code = Number(_8.defaultTo(code, 0));
    this.message = _8.defaultTo(message, "OK");
    this.data = _8.defaultTo(data, null);
    this.statusCode = Number(_8.defaultTo(statusCode, 200));
  }
  toObject() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
  static isInstance(value) {
    return value instanceof _Body;
  }
};

// src/lib/response/Response.ts
var Response = class _Response {
  /** 响应HTTP状态码 */
  statusCode;
  /** 响应内容类型 */
  type;
  /** 响应headers */
  headers;
  /** 重定向目标 */
  redirect;
  /** 响应载荷 */
  body;
  /** 响应载荷大小 */
  size;
  /** 响应时间戳 */
  time;
  constructor(body, options = {}) {
    const { statusCode, type, headers, redirect, size, time } = options;
    this.statusCode = Number(_9.defaultTo(statusCode, Body.isInstance(body) ? body.statusCode : void 0));
    this.type = type;
    this.headers = headers;
    this.redirect = redirect;
    this.size = size;
    this.time = Number(_9.defaultTo(time, util_default.timestamp()));
    this.body = body;
  }
  injectTo(ctx) {
    this.redirect && ctx.redirect(this.redirect);
    this.statusCode && (ctx.status = this.statusCode);
    this.type && (ctx.type = mime2.getType(this.type) || this.type);
    const headers = this.headers || {};
    if (this.size && !headers["Content-Length"] && !headers["content-length"])
      headers["Content-Length"] = this.size;
    ctx.set(headers);
    if (Body.isInstance(this.body))
      ctx.body = this.body.toObject();
    else
      ctx.body = this.body;
  }
  static isInstance(value) {
    return value instanceof _Response;
  }
};

// src/lib/response/FailureBody.ts
import _10 from "lodash";

// src/lib/consts/exceptions.ts
var exceptions_default2 = {
  SYSTEM_ERROR: [-1e3, "\u7CFB\u7EDF\u5F02\u5E38"],
  SYSTEM_REQUEST_VALIDATION_ERROR: [-1001, "\u8BF7\u6C42\u53C2\u6570\u6821\u9A8C\u9519\u8BEF"],
  SYSTEM_NOT_ROUTE_MATCHING: [-1002, "\u65E0\u5339\u914D\u7684\u8DEF\u7531"]
};

// src/lib/response/FailureBody.ts
var FailureBody = class _FailureBody extends Body {
  constructor(error, _data) {
    let errcode, errmsg, data = _data, httpStatusCode = http_status_codes_default.OK;
    ;
    if (_10.isString(error))
      error = new Exception(exceptions_default2.SYSTEM_ERROR, error);
    else if (error instanceof APIException || error instanceof Exception)
      ({ errcode, errmsg, data, httpStatusCode } = error);
    else if (_10.isError(error))
      ({ errcode, errmsg, data, httpStatusCode } = new Exception(exceptions_default2.SYSTEM_ERROR, error.message));
    super({
      code: errcode || -1,
      message: errmsg || "Internal error",
      data,
      statusCode: httpStatusCode
    });
  }
  static isInstance(value) {
    return value instanceof _FailureBody;
  }
};

// src/lib/server.ts
var Server = class {
  app;
  router;
  constructor() {
    this.app = new Koa();
    this.app.use(koaCors());
    this.app.use(koaRange);
    this.router = new KoaRouter({ prefix: config_default.service.urlPrefix });
    this.app.use(async (ctx, next) => {
      if (ctx.request.type === "application/xml" || ctx.request.type === "application/ssml+xml")
        ctx.req.headers["content-type"] = "text/xml";
      try {
        await next();
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        new Response(failureBody).injectTo(ctx);
      }
    });
    this.app.use(async (ctx, next) => {
      if (ctx.is("application/json") && ["POST", "PUT", "PATCH"].includes(ctx.method)) {
        logger_default.debug("\u5F00\u59CB\u81EA\u5B9A\u4E49 JSON \u89E3\u6790");
        const chunks = [];
        await new Promise((resolve, reject) => {
          ctx.req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          ctx.req.on("end", () => {
            resolve(null);
          });
          ctx.req.on("error", reject);
        });
        const body = Buffer.concat(chunks).toString("utf8");
        let cleanedBody = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u00A0/g, " ").replace(/[\u2000-\u200B]/g, " ").replace(/\uFEFF/g, "").trim();
        cleanedBody = cleanedBody.replace(/,(\s*[\r\n]*\s*[}\]])/g, "$1");
        let parsedBody;
        try {
          parsedBody = JSON.parse(cleanedBody);
        } catch (parseError) {
          logger_default.error(`JSON\u89E3\u6790\u5931\u8D25: ${parseError.message}`);
          logger_default.debug(`\u539F\u59CB\u8BF7\u6C42\u4F53: ${body.substring(0, 200)}...`);
          logger_default.debug(`\u6E05\u7406\u540E\u8BF7\u6C42\u4F53: ${cleanedBody.substring(0, 200)}...`);
          let fixedBody = cleanedBody;
          try {
            fixedBody = fixedBody.replace(/'/g, '"');
            fixedBody = fixedBody.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
            fixedBody = fixedBody.replace(/,(\s*[\r\n]*\s*[}\]])/g, "$1");
            fixedBody = fixedBody.replace(/,+/g, ",");
            parsedBody = JSON.parse(fixedBody);
            logger_default.debug("JSON\u4FEE\u590D\u6210\u529F");
          } catch (fixError) {
            logger_default.error(`JSON\u4FEE\u590D\u4E5F\u5931\u8D25: ${fixError.message}`);
            logger_default.debug(`\u4FEE\u590D\u540E\u7684JSON: ${fixedBody.substring(0, 200)}...`);
            throw new Error(`\u65E0\u6548\u7684JSON\u683C\u5F0F: ${parseError.message}`);
          }
        }
        logger_default.debug("JSON \u89E3\u6790\u6210\u529F\uFF0C\u8DF3\u8FC7 koa-body");
        ctx.request.body = parsedBody;
        ctx.request.rawBody = cleanedBody;
        ctx._jsonProcessed = true;
      }
      await next();
    });
    this.app.use(async (ctx, next) => {
      if (!ctx._jsonProcessed) {
        await koaBody(Object.assign(_11.clone(config_default.system.requestBody), {
          multipart: true,
          // 开启multipart文件上传
          formidable: {
            maxFileSize: 10 * 1024 * 1024
            // 限制最大10MB
          },
          enableTypes: ["json", "form", "text", "xml"]
          // 确保form类型被启用
        }))(ctx, next);
      } else {
        await next();
      }
    });
    this.app.on("error", (err) => {
      if (["ECONNRESET", "ECONNABORTED", "EPIPE", "ECANCELED"].includes(err.code)) return;
      logger_default.error(err);
    });
    logger_default.success("Server initialized");
  }
  /**
   * 附加路由
   *
   * @param routes 路由列表
   */
  attachRoutes(routes) {
    routes.forEach((route) => {
      const prefix = route.prefix || "";
      for (let method in route) {
        if (method === "prefix") continue;
        if (!_11.isObject(route[method])) {
          logger_default.warn(`Router ${prefix} ${method} invalid`);
          continue;
        }
        for (let uri in route[method]) {
          this.router[method](`${prefix}${uri}`, async (ctx) => {
            const { request: request2, response } = await this.#requestProcessing(ctx, route[method][uri]);
            if (response != null && config_default.system.requestLog) {
              if (ctx.request.url.endsWith("/ping")) {
                logger_default.debug(`<- ${request2.method} ${request2.url} ${response.time - request2.time}ms`);
              } else {
                logger_default.info(`<- ${request2.method} ${request2.url} ${response.time - request2.time}ms`);
              }
            }
          });
        }
      }
      logger_default.info(`Route ${config_default.service.urlPrefix || ""}${prefix} attached`);
    });
    this.app.use(this.router.routes());
    this.app.use((ctx) => {
      const request2 = new Request(ctx);
      logger_default.debug(`-> ${ctx.request.method} ${ctx.request.url} request is not supported - ${request2.remoteIP || "unknown"}`);
      const message = `[\u8BF7\u6C42\u6709\u8BEF]: \u6B63\u786E\u8BF7\u6C42\u4E3A POST -> /v1/chat/completions\uFF0C\u5F53\u524D\u8BF7\u6C42\u4E3A ${ctx.request.method} -> ${ctx.request.url} \u8BF7\u7EA0\u6B63`;
      logger_default.warn(message);
      const failureBody = new FailureBody(new Error(message));
      const response = new Response(failureBody);
      response.injectTo(ctx);
      if (config_default.system.requestLog)
        logger_default.info(`<- ${request2.method} ${request2.url} ${response.time - request2.time}ms`);
    });
  }
  /**
   * 请求处理
   *
   * @param ctx 上下文
   * @param routeFn 路由方法
   */
  #requestProcessing(ctx, routeFn) {
    return new Promise((resolve) => {
      const request2 = new Request(ctx);
      try {
        if (config_default.system.requestLog) {
          if (request2.url === "/ping") {
            logger_default.debug(`-> ${request2.method} ${request2.url}`);
          } else {
            logger_default.info(`-> ${request2.method} ${request2.url}`);
          }
        }
        routeFn(request2).then((response) => {
          try {
            if (!Response.isInstance(response)) {
              const _response = new Response(response);
              _response.injectTo(ctx);
              return resolve({ request: request2, response: _response });
            }
            response.injectTo(ctx);
            resolve({ request: request2, response });
          } catch (err) {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response2 = new Response(failureBody);
            response2.injectTo(ctx);
            resolve({ request: request2, response: response2 });
          }
        }).catch((err) => {
          try {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request: request2, response });
          } catch (err2) {
            logger_default.error(err2);
            const failureBody = new FailureBody(err2);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request: request2, response });
          }
        });
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        const response = new Response(failureBody);
        response.injectTo(ctx);
        resolve({ request: request2, response });
      }
    });
  }
  /**
   * 监听端口
   */
  async listen() {
    const host = config_default.service.host;
    const port = config_default.service.port;
    await Promise.all([
      new Promise((resolve, reject) => {
        if (host === "0.0.0.0" || host === "localhost" || host === "127.0.0.1")
          return resolve(null);
        this.app.listen(port, "localhost", (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      }),
      new Promise((resolve, reject) => {
        this.app.listen(port, host, (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      })
    ]);
    logger_default.success(`Server listening on port ${port} (${host})`);
  }
};
var server_default = new Server();

// src/api/routes/images.ts
import fs6 from "fs";
import _13 from "lodash";

// src/api/controllers/images.ts
import crypto3 from "crypto";

// src/api/controllers/core.ts
import _12 from "lodash";
import mime3 from "mime";
import axios2 from "axios";

// src/lib/error-handler.ts
var JimengErrorHandler = class {
  /**
   * 处理即梦API响应错误
   */
  static handleApiResponse(response, options = {}) {
    const { ret, errmsg, historyId } = response;
    const { context = "\u5373\u68A6API\u8BF7\u6C42", operation = "\u64CD\u4F5C" } = options;
    logger_default.error(`${context}\u5931\u8D25: ret=${ret}, errmsg=${errmsg}${historyId ? `, historyId=${historyId}` : ""}`);
    switch (ret) {
      case "1015":
        throw new APIException(exceptions_default.API_TOKEN_EXPIRES, `[\u767B\u5F55\u5931\u6548]: ${errmsg}\u3002\u8BF7\u91CD\u65B0\u83B7\u53D6refresh_token\u5E76\u66F4\u65B0\u914D\u7F6E`);
      case "5000":
        throw new APIException(
          exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS,
          `[\u79EF\u5206\u4E0D\u8DB3]: ${errmsg}\u3002\u5EFA\u8BAE\uFF1A1)\u5C1D\u8BD5\u4F7F\u75281024x1024\u5206\u8FA8\u7387\uFF0C2)\u68C0\u67E5\u662F\u5426\u9700\u8981\u8D2D\u4E70\u79EF\u5206\uFF0C3)\u786E\u8BA4\u8D26\u6237\u72B6\u6001\u6B63\u5E38`
        );
      case "4001":
        throw new APIException(exceptions_default.API_CONTENT_FILTERED, `[\u5185\u5BB9\u8FDD\u89C4]: ${errmsg}`);
      case "4002":
        throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, `[\u53C2\u6570\u9519\u8BEF]: ${errmsg}`);
      case "5001":
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `[\u751F\u6210\u5931\u8D25]: ${errmsg}`);
      case "5002":
        throw new APIException(exceptions_default.API_VIDEO_GENERATION_FAILED, `[\u89C6\u9891\u751F\u6210\u5931\u8D25]: ${errmsg}`);
      default:
        throw new APIException(exceptions_default.API_REQUEST_FAILED, `[${operation}\u5931\u8D25]: ${errmsg} (\u9519\u8BEF\u7801: ${ret})`);
    }
  }
  /**
   * 处理网络请求错误
   */
  static handleNetworkError(error, options = {}) {
    var _a, _b;
    const { context = "\u7F51\u7EDC\u8BF7\u6C42", retryCount = 0, maxRetries = 3 } = options;
    logger_default.error(`${context}\u7F51\u7EDC\u9519\u8BEF (\u5C1D\u8BD5 ${retryCount + 1}/${maxRetries + 1}): ${error.message}`);
    if (error.code === "ECONNABORTED") {
      throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42\u8D85\u65F6]: ${context}\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5`);
    }
    if (error.code === "ENOTFOUND") {
      throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u7F51\u7EDC\u9519\u8BEF]: \u65E0\u6CD5\u8FDE\u63A5\u5230\u5373\u68A6\u670D\u52A1\u5668\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5`);
    }
    if (((_a = error.response) == null ? void 0 : _a.status) >= 500) {
      throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u670D\u52A1\u5668\u9519\u8BEF]: \u5373\u68A6\u670D\u52A1\u5668\u6682\u65F6\u4E0D\u53EF\u7528 (${error.response.status})`);
    }
    if (((_b = error.response) == null ? void 0 : _b.status) === 429) {
      throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42\u9891\u7387\u9650\u5236]: \u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5`);
    }
    throw new APIException(exceptions_default.API_REQUEST_FAILED, `[${context}\u5931\u8D25]: ${error.message}`);
  }
  /**
   * 处理轮询超时错误
   * @returns 如果有部分结果，返回 void 而不抛出异常
   */
  static handlePollingTimeout(pollCount, maxPollCount, elapsedTime, status, itemCount, historyId) {
    const message = `\u8F6E\u8BE2\u8D85\u65F6: \u5DF2\u8F6E\u8BE2 ${pollCount} \u6B21\uFF0C\u8017\u65F6 ${elapsedTime} \u79D2\uFF0C\u6700\u7EC8\u72B6\u6001: ${status}\uFF0C\u56FE\u7247\u6570\u91CF: ${itemCount}`;
    logger_default.warn(message + (historyId ? `\uFF0C\u5386\u53F2ID: ${historyId}` : ""));
    if (itemCount === 0) {
      throw new APIException(
        exceptions_default.API_IMAGE_GENERATION_FAILED,
        `\u751F\u6210\u8D85\u65F6\u4E14\u65E0\u7ED3\u679C\uFF0C\u72B6\u6001\u7801: ${status}${historyId ? `\uFF0C\u5386\u53F2ID: ${historyId}` : ""}`
      );
    }
    logger_default.info(`\u8F6E\u8BE2\u8D85\u65F6\u4F46\u5DF2\u83B7\u5F97 ${itemCount} \u5F20\u56FE\u7247\uFF0C\u5C06\u8FD4\u56DE\u73B0\u6709\u7ED3\u679C`);
  }
  /**
   * 处理生成失败错误
   * @param itemCount 已生成的结果数量，如果 > 0 则不抛出异常
   * @returns 如果有部分结果，返回 false 表示不应抛出异常
   */
  static handleGenerationFailure(status, failCode, historyId, type = "image", itemCount = 0) {
    const typeText = type === "image" ? "\u56FE\u50CF" : "\u89C6\u9891";
    const message = `${typeText}\u751F\u6210\u6700\u7EC8\u5931\u8D25: status=${status}, failCode=${failCode}${historyId ? `, historyId=${historyId}` : ""}, \u5DF2\u751F\u6210\u6570\u91CF=${itemCount}`;
    if (itemCount > 0) {
      logger_default.warn(message);
      logger_default.info(`${typeText}\u751F\u6210\u90E8\u5206\u5931\u8D25\uFF0C\u4F46\u5DF2\u83B7\u5F97 ${itemCount} \u4E2A\u7ED3\u679C\uFF0C\u5C06\u8FD4\u56DE\u73B0\u6709\u7ED3\u679C`);
      return false;
    }
    logger_default.error(message);
    const exception = type === "image" ? exceptions_default.API_IMAGE_GENERATION_FAILED : exceptions_default.API_VIDEO_GENERATION_FAILED;
    throw new APIException(exception, `${typeText}\u751F\u6210\u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${status}${failCode ? `\uFF0C\u9519\u8BEF\u7801: ${failCode}` : ""}`);
  }
  /**
   * 包装重试逻辑的错误处理
   */
  static async withRetry(operation, options = {}) {
    const {
      maxRetries = 3,
      retryDelay = 5e3,
      context = "\u64CD\u4F5C",
      operation: operationName = "\u8BF7\u6C42"
    } = options;
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (error instanceof APIException) {
          throw error;
        }
        if (attempt < maxRetries) {
          logger_default.warn(`${context}\u5931\u8D25 (\u5C1D\u8BD5 ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
          logger_default.info(`${retryDelay / 1e3}\u79D2\u540E\u91CD\u8BD5...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
    this.handleNetworkError(lastError, {
      context,
      retryCount: maxRetries,
      maxRetries,
      operation: operationName
    });
  }
};
var handleJimengError = JimengErrorHandler.handleApiResponse;
var handleNetworkError = JimengErrorHandler.handleNetworkError;
var handlePollingTimeout = JimengErrorHandler.handlePollingTimeout;
var handleGenerationFailure = JimengErrorHandler.handleGenerationFailure;
var withRetry = JimengErrorHandler.withRetry;

// src/api/consts/dreamina.ts
var BASE_URL_DREAMINA_US = "https://dreamina-api.us.capcut.com";
var BASE_URL_IMAGEX_US = "https://imagex16-normal-us-ttp.capcutapi.us";
var BASE_URL_DREAMINA_HK = "https://mweb-api-sg.capcut.com";
var BASE_URL_IMAGEX_HK = "https://imagex-normal-sg.capcutapi.com";
var WEB_VERSION = "7.5.0";
var DA_VERSION = "3.3.2";
var AIGC_FEATURES = "app_lip_sync";

// src/api/consts/common.ts
var BASE_URL_CN = "https://jimeng.jianying.com";
var BASE_URL_US_COMMERCE = "https://commerce.us.capcut.com";
var BASE_URL_HK_COMMERCE = "https://commerce-api-sg.capcut.com";
var DEFAULT_ASSISTANT_ID_CN = 513695;
var DEFAULT_ASSISTANT_ID_US = 513641;
var DEFAULT_ASSISTANT_ID_HK = 513641;
var DEFAULT_ASSISTANT_ID_JP = 513641;
var DEFAULT_ASSISTANT_ID_SG = 513641;
var REGION_CN = "cn";
var REGION_US = "US";
var REGION_HK = "HK";
var REGION_JP = "JP";
var REGION_SG = "SG";
var PLATFORM_CODE = "7";
var VERSION_CODE = "5.8.0";
var DEFAULT_IMAGE_MODEL = "jimeng-4.6";
var DEFAULT_VIDEO_MODEL = "jimeng-video-3.0";
var DRAFT_VERSION = "3.3.4";
var DRAFT_MIN_VERSION = "3.0.2";
var IMAGE_MODEL_MAP = {
  "jimeng-5.0": "high_aes_general_v50",
  "jimeng-4.6": "high_aes_general_v42",
  "jimeng-4.5": "high_aes_general_v40l",
  "jimeng-4.1": "high_aes_general_v41",
  "jimeng-4.0": "high_aes_general_v40",
  "jimeng-3.1": "high_aes_general_v30l_art_fangzhou:general_v3.0_18b",
  "jimeng-3.0": "high_aes_general_v30l:general_v3.0_18b",
  "jimeng-2.1": "high_aes_general_v21_L:general_v2.1_L",
  "jimeng-2.0-pro": "high_aes_general_v20_L:general_v2.0_L",
  "jimeng-2.0": "high_aes_general_v20:general_v2.0",
  "jimeng-1.4": "high_aes_general_v14:general_v1.4",
  "jimeng-xl-pro": "text2img_xl_sft"
};
var IMAGE_MODEL_MAP_US = {
  "jimeng-4.0": "high_aes_general_v40",
  "jimeng-3.0": "high_aes_general_v30l:general_v3.0_18b",
  "nanobanana": "external_model_gemini_flash_image_v25",
  "nanobananapro": "dreamina_image_lib_1"
};
var VIDEO_MODEL_MAP = {
  "jimeng-video-4.0-pro": "dreamina_seedance_40_pro",
  "jimeng-video-4.0": "dreamina_seedance_40",
  "jimeng-video-3.5-pro": "dreamina_ic_generate_video_model_vgfm_3.5_pro",
  "jimeng-video-3.0-pro": "dreamina_ic_generate_video_model_vgfm_3.0_pro",
  "jimeng-video-3.0": "dreamina_ic_generate_video_model_vgfm_3.0",
  "jimeng-video-3.0-fast": "dreamina_ic_generate_video_model_vgfm_3.0_fast",
  "jimeng-video-2.0": "dreamina_ic_generate_video_model_vgfm_lite",
  "jimeng-video-2.0-pro": "dreamina_ic_generate_video_model_vgfm1.0"
};
var STATUS_CODE_MAP = {
  20: "PROCESSING",
  10: "SUCCESS",
  30: "FAILED",
  42: "POST_PROCESSING",
  45: "FINALIZING",
  50: "COMPLETED"
};
var RETRY_CONFIG = {
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY: 5e3
};
var POLLING_CONFIG = {
  MAX_POLL_COUNT: 900,
  // 15分钟
  POLL_INTERVAL: 5e3,
  // 1秒
  STABLE_ROUNDS: 5,
  // 稳定轮次
  TIMEOUT_SECONDS: 900
  // 15分钟超时
};
var RESOLUTION_OPTIONS = {
  "1k": {
    "1:1": { width: 1024, height: 1024, ratio: 1 },
    "4:3": { width: 768, height: 1024, ratio: 4 },
    "3:4": { width: 1024, height: 768, ratio: 2 },
    "16:9": { width: 1024, height: 576, ratio: 3 },
    "9:16": { width: 576, height: 1024, ratio: 5 },
    "3:2": { width: 1024, height: 682, ratio: 7 },
    "2:3": { width: 682, height: 1024, ratio: 6 },
    "21:9": { width: 1195, height: 512, ratio: 8 }
  },
  "2k": {
    "1:1": { width: 2048, height: 2048, ratio: 1 },
    "4:3": { width: 2304, height: 1728, ratio: 4 },
    "3:4": { width: 1728, height: 2304, ratio: 2 },
    "16:9": { width: 2560, height: 1440, ratio: 3 },
    "9:16": { width: 1440, height: 2560, ratio: 5 },
    "3:2": { width: 2496, height: 1664, ratio: 7 },
    "2:3": { width: 1664, height: 2496, ratio: 6 },
    "21:9": { width: 3024, height: 1296, ratio: 8 }
  },
  "4k": {
    "1:1": { width: 4096, height: 4096, ratio: 101 },
    "4:3": { width: 4608, height: 3456, ratio: 104 },
    "3:4": { width: 3456, height: 4608, ratio: 102 },
    "16:9": { width: 5120, height: 2880, ratio: 103 },
    "9:16": { width: 2880, height: 5120, ratio: 105 },
    "3:2": { width: 4992, height: 3328, ratio: 107 },
    "2:3": { width: 3328, height: 4992, ratio: 106 },
    "21:9": { width: 6048, height: 2592, ratio: 108 }
  }
};

// src/api/controllers/core.ts
var DEVICE_ID = Math.random() * 1e18 + 7e18;
var WEB_ID = Math.random() * 1e18 + 7e18;
var USER_ID = util_default.uuid(false);
var FAKE_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-language": "zh-CN,zh;q=0.9",
  "Cache-control": "no-cache",
  Appvr: VERSION_CODE,
  Pragma: "no-cache",
  Priority: "u=1, i",
  Pf: PLATFORM_CODE,
  "Sec-Ch-Ua": '"Google Chrome";v="142", "Chromium";v="142", "Not_A Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
};
var FILE_MAX_SIZE = 100 * 1024 * 1024;
async function acquireToken(refreshToken) {
  return refreshToken;
}
function parseRegionFromToken(refreshToken) {
  const token = refreshToken.toLowerCase();
  const isUS = token.startsWith("us-");
  const isHK = token.startsWith("hk-");
  const isJP = token.startsWith("jp-");
  const isSG = token.startsWith("sg-");
  const isInternational = isUS || isHK || isJP || isSG;
  return {
    isUS,
    isHK,
    isJP,
    isSG,
    isInternational,
    isCN: !isInternational
  };
}
function getRefererByRegion(refreshToken, cnPath) {
  const { isInternational } = parseRegionFromToken(refreshToken);
  return isInternational ? "https://dreamina.capcut.com/" : `https://jimeng.jianying.com${cnPath}`;
}
function getAssistantId(regionInfo) {
  if (regionInfo.isUS) return DEFAULT_ASSISTANT_ID_US;
  if (regionInfo.isJP) return DEFAULT_ASSISTANT_ID_JP;
  if (regionInfo.isSG) return DEFAULT_ASSISTANT_ID_SG;
  if (regionInfo.isHK) return DEFAULT_ASSISTANT_ID_HK;
  return DEFAULT_ASSISTANT_ID_CN;
}
function generateCookie(refreshToken) {
  const { isUS, isHK, isJP, isSG } = parseRegionFromToken(refreshToken);
  const token = isUS || isHK || isJP || isSG ? refreshToken.substring(3) : refreshToken;
  let storeRegion = "cn-gd";
  if (isUS) storeRegion = "us";
  else if (isHK) storeRegion = "hk";
  else if (isJP) storeRegion = "hk";
  else if (isSG) storeRegion = "hk";
  return [
    `_tea_web_id=${WEB_ID}`,
    `is_staff_user=false`,
    `store-region=${storeRegion}`,
    `store-region-src=uid`,
    `sid_guard=${token}%7C${util_default.unixTimestamp()}%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT`,
    `uid_tt=${USER_ID}`,
    `uid_tt_ss=${USER_ID}`,
    `sid_tt=${token}`,
    `sessionid=${token}`,
    `sessionid_ss=${token}`,
    `sid_tt=${token}`
  ].join("; ");
}
async function getCredit(refreshToken) {
  const referer = getRefererByRegion(refreshToken, "/ai-tool/image/generate");
  const {
    credit: { gift_credit, purchase_credit, vip_credit }
  } = await request("POST", "/commerce/v1/benefits/user_credit", refreshToken, {
    data: {},
    headers: {
      Referer: referer
    },
    noDefaultParams: true
  });
  logger_default.info(`
\u79EF\u5206\u4FE1\u606F: 
\u8D60\u9001\u79EF\u5206: ${gift_credit}, \u8D2D\u4E70\u79EF\u5206: ${purchase_credit}, VIP\u79EF\u5206: ${vip_credit}`);
  return {
    giftCredit: gift_credit,
    purchaseCredit: purchase_credit,
    vipCredit: vip_credit,
    totalCredit: gift_credit + purchase_credit + vip_credit
  };
}
async function receiveCredit(refreshToken) {
  logger_default.info("\u6B63\u5728\u6536\u53D6\u4ECA\u65E5\u79EF\u5206...");
  const referer = getRefererByRegion(refreshToken, "/ai-tool/home");
  const { cur_total_credits, receive_quota } = await request("POST", "/commerce/v1/benefits/credit_receive", refreshToken, {
    data: {
      time_zone: "Asia/Shanghai"
    },
    headers: {
      Referer: referer
    }
  });
  logger_default.info(`
\u4ECA\u65E5${receive_quota}\u79EF\u5206\u6536\u53D6\u6210\u529F
\u5269\u4F59\u79EF\u5206: ${cur_total_credits}`);
  return cur_total_credits;
}
async function request(method, uri, refreshToken, options = {}) {
  const regionInfo = parseRegionFromToken(refreshToken);
  const { isUS, isHK, isJP, isSG } = regionInfo;
  const token = await acquireToken(regionInfo.isInternational ? refreshToken.substring(3) : refreshToken);
  const deviceTime = util_default.unixTimestamp();
  const sign = util_default.md5(
    `9e2c|${uri.slice(-7)}|${PLATFORM_CODE}|${VERSION_CODE}|${deviceTime}||11ac`
  );
  let baseUrl;
  let aid;
  let region;
  if (isUS) {
    if (uri.startsWith("/commerce/")) {
      baseUrl = BASE_URL_US_COMMERCE;
    } else {
      baseUrl = BASE_URL_DREAMINA_US;
    }
    aid = DEFAULT_ASSISTANT_ID_US;
    region = REGION_US;
  } else if (isHK || isJP || isSG) {
    if (uri.startsWith("/commerce/")) {
      baseUrl = BASE_URL_HK_COMMERCE;
    } else {
      baseUrl = BASE_URL_DREAMINA_HK;
    }
    if (isJP) {
      aid = DEFAULT_ASSISTANT_ID_JP;
      region = REGION_JP;
    } else if (isSG) {
      aid = DEFAULT_ASSISTANT_ID_SG;
      region = REGION_SG;
    } else {
      aid = DEFAULT_ASSISTANT_ID_HK;
      region = REGION_HK;
    }
  } else {
    baseUrl = BASE_URL_CN;
    aid = DEFAULT_ASSISTANT_ID_CN;
    region = REGION_CN;
  }
  const origin = new URL(baseUrl).origin;
  const fullUrl = `${baseUrl}${uri}`;
  const requestParams = options.noDefaultParams ? options.params || {} : {
    aid,
    device_platform: "web",
    region,
    ...isUS || isHK || isJP || isSG ? {} : { webId: WEB_ID },
    da_version: "3.3.2",
    web_component_open_flag: 1,
    web_version: "7.5.0",
    aigc_features: "app_lip_sync",
    ...options.params || {}
  };
  const headers = {
    ...FAKE_HEADERS,
    Origin: origin,
    Referer: origin,
    Appid: aid,
    Cookie: generateCookie(refreshToken),
    "Device-Time": deviceTime,
    Sign: sign,
    "Sign-Ver": "1",
    ...options.headers || {}
  };
  logger_default.info(`\u53D1\u9001\u8BF7\u6C42: ${method.toUpperCase()} ${fullUrl}`);
  logger_default.info(`\u8BF7\u6C42\u53C2\u6570: ${JSON.stringify(requestParams)}`);
  logger_default.info(`\u8BF7\u6C42\u6570\u636E: ${JSON.stringify(options.data || {})}`);
  let retries = 0;
  const maxRetries = RETRY_CONFIG.MAX_RETRY_COUNT;
  let lastError = null;
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        logger_default.info(`\u7B2C ${retries} \u6B21\u91CD\u8BD5\u8BF7\u6C42: ${method.toUpperCase()} ${fullUrl}`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY));
      }
      const response = await axios2.request({
        method,
        url: fullUrl,
        params: requestParams,
        headers,
        timeout: 45e3,
        // 增加超时时间到45秒
        validateStatus: () => true,
        // 允许任何状态码
        ..._12.omit(options, "params", "headers")
      });
      logger_default.info(`\u54CD\u5E94\u72B6\u6001: ${response.status} ${response.statusText}`);
      if (options.responseType == "stream") return response;
      const responseDataSummary = JSON.stringify(response.data).substring(0, 500) + (JSON.stringify(response.data).length > 500 ? "..." : "");
      logger_default.info(`\u54CD\u5E94\u6570\u636E\u6458\u8981: ${responseDataSummary}`);
      if (response.status >= 400) {
        logger_default.warn(`HTTP\u9519\u8BEF: ${response.status} ${response.statusText}`);
        if (retries < maxRetries) {
          retries++;
          continue;
        }
      }
      return checkResult(response);
    } catch (error) {
      lastError = error;
      logger_default.error(`\u8BF7\u6C42\u5931\u8D25 (\u5C1D\u8BD5 ${retries + 1}/${maxRetries + 1}): ${error.message}`);
      if ((error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || error.message.includes("timeout") || error.message.includes("network")) && retries < maxRetries) {
        retries++;
        continue;
      }
      break;
    }
  }
  if (lastError) {
    logger_default.error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u5DF2\u91CD\u8BD5 ${retries} \u6B21: ${lastError.message}`);
    if (lastError.response) {
      logger_default.error(`\u54CD\u5E94\u72B6\u6001: ${lastError.response.status}`);
      logger_default.error(`\u54CD\u5E94\u6570\u636E: ${JSON.stringify(lastError.response.data)}`);
    }
    throw lastError;
  } else {
    const error = new Error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u5DF2\u91CD\u8BD5 ${retries} \u6B21\uFF0C\u4F46\u6CA1\u6709\u5177\u4F53\u9519\u8BEF\u4FE1\u606F`);
    logger_default.error(error.message);
    throw error;
  }
}
function checkResult(result) {
  const { ret, errmsg, data } = result.data;
  if (!_12.isFinite(Number(ret))) return result.data;
  if (ret === "0") return data;
  JimengErrorHandler.handleApiResponse(result.data, {
    context: "\u5373\u68A6API\u8BF7\u6C42",
    operation: "\u8BF7\u6C42"
  });
}
function tokenSplit(authorization) {
  return authorization.replace("Bearer ", "").split(",");
}
async function getTokenLiveStatus(refreshToken) {
  const result = await request(
    "POST",
    "/passport/account/info/v2",
    refreshToken,
    {
      params: {
        account_sdk_source: "web"
      }
    }
  );
  try {
    const { user_id } = checkResult(result);
    return !!user_id;
  } catch (err) {
    return false;
  }
}

// src/api/controllers/get_historyId.ts
var DEFAULT_ASSISTANT_ID = "513695";
async function getImageByHistoryId(historyId, refreshToken) {
  const maxRetries = 3;
  const retryDelay = 2e3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "post",
        "/mweb/v1/get_history_by_ids",
        refreshToken,
        {
          data: {
            history_ids: [historyId],
            image_info: {
              width: 2048,
              height: 2048,
              format: "webp"
            },
            http_common_info: {
              aid: Number(DEFAULT_ASSISTANT_ID),
              device_platform: "web",
              region: "CN"
            }
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );
      logger_default.info(`\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u54CD\u5E94 (\u5C1D\u8BD5 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);
      if (!result) {
        if (attempt < maxRetries) {
          logger_default.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u670D\u52A1\u5668\u8FD4\u56DE\u7A7A\u54CD\u5E94");
      }
      if (typeof result !== "object") {
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u54CD\u5E94\u683C\u5F0F\u9519\u8BEF");
      }
      if (!result[historyId]) {
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u5386\u53F2\u8BB0\u5F55\u4E0D\u5B58\u5728");
      }
      const item_list = result[historyId].item_list || [];
      return {
        images: item_list.map((item) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          return {
            webp: ((_b = (_a = item == null ? void 0 : item.common_attr) == null ? void 0 : _a.cover_url_map) == null ? void 0 : _b["2400"]) || "",
            cover: ((_d = (_c = item == null ? void 0 : item.common_attr) == null ? void 0 : _c.cover_url_map) == null ? void 0 : _d["1080"]) || "",
            png: ((_e = item == null ? void 0 : item.common_attr) == null ? void 0 : _e.cover_url) || "",
            large: ((_h = (_g = (_f = item == null ? void 0 : item.image) == null ? void 0 : _f.large_images) == null ? void 0 : _g[0]) == null ? void 0 : _h.image_url) || ""
          };
        })
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger_default.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u8D85\u8FC7\u6700\u5927\u91CD\u8BD5\u6B21\u6570");
}
async function getImagesByHistoryIds(historyIds, refreshToken) {
  const maxRetries = 3;
  const retryDelay = 2e3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "post",
        "/mweb/v1/get_history_by_ids",
        refreshToken,
        {
          data: {
            history_ids: historyIds,
            image_info: {
              width: 2048,
              height: 2048,
              format: "webp"
            },
            http_common_info: {
              aid: Number(DEFAULT_ASSISTANT_ID),
              device_platform: "web",
              region: "CN"
            }
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );
      logger_default.info(`\u6279\u91CF\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u54CD\u5E94 (\u5C1D\u8BD5 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);
      if (!result) {
        if (attempt < maxRetries) {
          logger_default.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u6279\u91CF\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u670D\u52A1\u5668\u8FD4\u56DE\u7A7A\u54CD\u5E94");
      }
      if (typeof result !== "object") {
        throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u6279\u91CF\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u54CD\u5E94\u683C\u5F0F\u9519\u8BEF");
      }
      const results = {};
      for (const historyId of historyIds) {
        if (!result[historyId]) {
          results[historyId] = {
            error: "\u5386\u53F2\u8BB0\u5F55\u4E0D\u5B58\u5728",
            images: []
          };
          continue;
        }
        const item_list = result[historyId].item_list || [];
        results[historyId] = {
          images: item_list.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return {
              webp: ((_b = (_a = item == null ? void 0 : item.common_attr) == null ? void 0 : _a.cover_url_map) == null ? void 0 : _b["2400"]) || "",
              cover: ((_d = (_c = item == null ? void 0 : item.common_attr) == null ? void 0 : _c.cover_url_map) == null ? void 0 : _d["1080"]) || "",
              png: ((_e = item == null ? void 0 : item.common_attr) == null ? void 0 : _e.cover_url) || "",
              large: ((_h = (_g = (_f = item == null ? void 0 : item.image) == null ? void 0 : _f.large_images) == null ? void 0 : _g[0]) == null ? void 0 : _h.image_url) || ""
            };
          })
        };
      }
      return results;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger_default.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u6279\u91CF\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25: \u8D85\u8FC7\u6700\u5927\u91CD\u8BD5\u6B21\u6570");
}
async function getAssetList(refreshToken) {
  const maxRetries = 3;
  const retryDelay = 2e3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "get",
        "/mweb/v1/get_asset_list",
        refreshToken,
        {
          params: {
            aid: DEFAULT_ASSISTANT_ID,
            da_version: "3.2.5",
            aigc_features: "app_lip_sync"
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );
      logger_default.info(`\u83B7\u53D6\u8D44\u4EA7\u5217\u8868\u54CD\u5E94 (\u5C1D\u8BD5 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);
      if (!result) {
        if (attempt < maxRetries) {
          logger_default.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u83B7\u53D6\u8D44\u4EA7\u5217\u8868\u5931\u8D25: \u670D\u52A1\u5668\u8FD4\u56DE\u7A7A\u54CD\u5E94");
      }
      if (typeof result !== "object") {
        throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u83B7\u53D6\u8D44\u4EA7\u5217\u8868\u5931\u8D25: \u54CD\u5E94\u683C\u5F0F\u9519\u8BEF");
      }
      return {
        assets: result.asset_list || [],
        total: result.total || 0
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger_default.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u83B7\u53D6\u8D44\u4EA7\u5217\u8868\u5931\u8D25: \u8D85\u8FC7\u6700\u5927\u91CD\u8BD5\u6B21\u6570");
}

// src/lib/aws-signature.ts
import crypto2 from "crypto";
function createSignature(method, url, headers, accessKeyId, secretAccessKey, sessionToken, payload = "", region = "cn-north-1") {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname || "/";
  const search = urlObj.search;
  const timestamp = headers["x-amz-date"];
  const date = timestamp.substr(0, 8);
  const service = "imagex";
  const queryParams = [];
  const searchParams = new URLSearchParams(search);
  searchParams.forEach((value, key) => {
    queryParams.push([key, value]);
  });
  queryParams.sort(([a], [b]) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  const canonicalQueryString = queryParams.map(([key, value]) => `${key}=${value}`).join("&");
  const headersToSign = {
    "x-amz-date": timestamp
  };
  if (sessionToken) {
    headersToSign["x-amz-security-token"] = sessionToken;
  }
  let payloadHash = crypto2.createHash("sha256").update("").digest("hex");
  if (method.toUpperCase() === "POST" && payload) {
    payloadHash = crypto2.createHash("sha256").update(payload, "utf8").digest("hex");
    headersToSign["x-amz-content-sha256"] = payloadHash;
  }
  const signedHeaders = Object.keys(headersToSign).map((key) => key.toLowerCase()).sort().join(";");
  const canonicalHeaders = Object.keys(headersToSign).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((key) => `${key.toLowerCase()}:${headersToSign[key].trim()}
`).join("");
  const canonicalRequest = [
    method.toUpperCase(),
    pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    credentialScope,
    crypto2.createHash("sha256").update(canonicalRequest, "utf8").digest("hex")
  ].join("\n");
  const kDate = crypto2.createHmac("sha256", `AWS4${secretAccessKey}`).update(date).digest();
  const kRegion = crypto2.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto2.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto2.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto2.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// src/api/controllers/images.ts
var DEFAULT_MODEL = DEFAULT_IMAGE_MODEL;
function getResolutionParams(resolution = "2k", ratio = "1:1") {
  const resolutionGroup = RESOLUTION_OPTIONS[resolution];
  if (!resolutionGroup) {
    const supportedResolutions = Object.keys(RESOLUTION_OPTIONS).join(", ");
    throw new Error(`\u4E0D\u652F\u6301\u7684\u5206\u8FA8\u7387 "${resolution}"\u3002\u652F\u6301\u7684\u5206\u8FA8\u7387: ${supportedResolutions}`);
  }
  const ratioConfig = resolutionGroup[ratio];
  if (!ratioConfig) {
    const supportedRatios = Object.keys(resolutionGroup).join(", ");
    throw new Error(`\u5728 "${resolution}" \u5206\u8FA8\u7387\u4E0B\uFF0C\u4E0D\u652F\u6301\u7684\u6BD4\u4F8B "${ratio}"\u3002\u652F\u6301\u7684\u6BD4\u4F8B: ${supportedRatios}`);
  }
  return {
    width: ratioConfig.width,
    height: ratioConfig.height,
    image_ratio: ratioConfig.ratio,
    resolution_type: resolution
  };
}
function getModel(model, isUS) {
  const modelMap = isUS ? IMAGE_MODEL_MAP_US : IMAGE_MODEL_MAP;
  if (isUS && !modelMap[model]) {
    const supportedModels = Object.keys(modelMap).join(", ");
    throw new Error(`\u56FD\u9645\u7248\u4E0D\u652F\u6301\u6A21\u578B "${model}"\u3002\u652F\u6301\u7684\u6A21\u578B: ${supportedModels}`);
  }
  return modelMap[model] || modelMap[DEFAULT_MODEL];
}
function calculateCRC32(buffer) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let crc2 = i;
    for (let j = 0; j < 8; j++) {
      crc2 = crc2 & 1 ? 3988292384 ^ crc2 >>> 1 : crc2 >>> 1;
    }
    crcTable[i] = crc2;
  }
  let crc = 0 ^ -1;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    crc = crc >>> 8 ^ crcTable[(crc ^ bytes[i]) & 255];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
}
async function uploadImageFromUrl(imageUrl, refreshToken, isUS) {
  try {
    logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u56FE\u7247: ${imageUrl} (isUS: ${isUS})`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    return await uploadImageFromBuffer(Buffer.from(imageBuffer), refreshToken, isUS);
  } catch (error) {
    logger_default.error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function uploadImageFromBuffer(imageBuffer, refreshToken, isUS) {
  var _a, _b, _c, _d;
  try {
    logger_default.info(`\u5F00\u59CB\u901A\u8FC7Buffer\u4E0A\u4F20\u56FE\u7247... (isUS: ${isUS})`);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
      },
      params: isUS ? {
        aid: DEFAULT_ASSISTANT_ID_US,
        web_version: WEB_VERSION,
        da_version: DA_VERSION,
        aigc_features: AIGC_FEATURES
      } : {
        aid: DEFAULT_ASSISTANT_ID_CN.toString()
      }
    });
    const { access_key_id, secret_access_key, session_token } = tokenResult;
    const service_id = isUS ? tokenResult.space_name : tokenResult.service_id;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25");
    }
    const actualServiceId = service_id || (isUS ? "wopfjsm1ax" : "tb4s082cfz");
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: service_id=${actualServiceId}`);
    const fileSize = imageBuffer.byteLength;
    const crc32 = calculateCRC32(imageBuffer);
    logger_default.info(`\u56FE\u7247Buffer: \u5927\u5C0F=${fileSize}\u5B57\u8282, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrlHost = isUS ? BASE_URL_IMAGEX_US : "https://imagex.bytedanceapi.com";
    const applyUrl = `${applyUrlHost}/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}${isUS ? "&device_platform=web" : ""}`;
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token);
    const origin = isUS ? new URL(BASE_URL_DREAMINA_US).origin : "https://jimeng.jianying.com";
    const applyResponse = await fetch(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "authorization": authorization,
        "origin": origin,
        "referer": `${origin}/ai-tool/generate`,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": timestamp,
        "x-amz-security-token": session_token
      }
    });
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${applyResponse.status} - ${errorText}`);
    }
    const applyResult = await applyResponse.json();
    if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`\u83B7\u53D6\u4E0A\u4F20\u5730\u5740\u5931\u8D25: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
      body: imageBuffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
    }
    const commitUrl = `${applyUrlHost}/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey
    });
    const payloadHash = crypto3.createHash("sha256").update(commitPayload, "utf8").digest("hex");
    const commitRequestHeaders = {
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    };
    const commitAuthorization = createSignature("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload);
    const commitResponse = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": commitTimestamp,
        "x-amz-security-token": session_token,
        "x-amz-content-sha256": payloadHash
      },
      body: commitPayload
    });
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${commitResponse.status} - ${errorText}`);
    }
    const commitResult = await commitResponse.json();
    if ((_c = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _c.Error) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!((_d = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _d.Results) || commitResult.Result.Results.length === 0) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u54CD\u5E94\u7F3A\u5C11\u7ED3\u679C: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2e3) {
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u72B6\u6001\u5F02\u5E38: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    logger_default.info(`\u56FE\u7247Buffer\u4E0A\u4F20\u5B8C\u6210: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`\u56FE\u7247Buffer\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function generateImageComposition(_model, prompt, images, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = ""
}, refreshToken) {
  const isUS = refreshToken.toLowerCase().startsWith("us-");
  const model = getModel(_model, isUS);
  let width, height, image_ratio, resolution_type;
  if (_model === "nanobanana") {
    logger_default.warn("nanobanana\u6A21\u578B\u5F53\u524D\u56FA\u5B9A\u4F7F\u75281024x1024\u5206\u8FA8\u7387\u548C2k\u7684\u6E05\u6670\u5EA6\uFF0C\u60A8\u8F93\u5165\u7684\u53C2\u6570\u5C06\u88AB\u5FFD\u7565\u3002");
    width = 1024;
    height = 1024;
    image_ratio = 1;
    resolution_type = "2k";
  } else {
    const params = getResolutionParams(resolution, ratio);
    width = params.width;
    height = params.height;
    image_ratio = params.image_ratio;
    resolution_type = params.resolution_type;
  }
  const imageCount = images.length;
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} \u56FE\u751F\u56FE\u529F\u80FD ${imageCount}\u5F20\u56FE\u7247 ${width}x${height} \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  try {
    const { totalCredit } = await getCredit(refreshToken);
    if (totalCredit <= 0)
      await receiveCredit(refreshToken);
  } catch (e) {
    logger_default.warn(`\u83B7\u53D6\u79EF\u5206\u5931\u8D25\uFF0C\u53EF\u80FD\u662F\u4E0D\u652F\u6301\u7684\u533A\u57DF\u6216token\u5DF2\u5931\u6548: ${e.message}`);
  }
  const uploadedImageIds = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const image = images[i];
      let imageId;
      if (typeof image === "string") {
        logger_default.info(`\u6B63\u5728\u5904\u7406\u7B2C ${i + 1}/${imageCount} \u5F20\u56FE\u7247 (URL)...`);
        imageId = await uploadImageFromUrl(image, refreshToken, isUS);
      } else {
        logger_default.info(`\u6B63\u5728\u5904\u7406\u7B2C ${i + 1}/${imageCount} \u5F20\u56FE\u7247 (Buffer)...`);
        imageId = await uploadImageFromBuffer(image, refreshToken, isUS);
      }
      uploadedImageIds.push(imageId);
      logger_default.info(`\u56FE\u7247 ${i + 1}/${imageCount} \u4E0A\u4F20\u6210\u529F: ${imageId}`);
    } catch (error) {
      logger_default.error(`\u56FE\u7247 ${i + 1}/${imageCount} \u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    }
  }
  logger_default.info(`\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210\uFF0C\u5F00\u59CB\u56FE\u751F\u56FE: ${uploadedImageIds.join(", ")}`);
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const core_param = {
    type: "",
    id: util_default.uuid(),
    model,
    prompt: `##${prompt}`,
    sample_strength: sampleStrength,
    image_ratio,
    large_image_info: {
      type: "",
      id: util_default.uuid(),
      height,
      width,
      resolution_type
    },
    intelligent_ratio: false
  };
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {},
      data: {
        extend: {
          root_model: model
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          generateId: submitId,
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "blend",
              abilities: {
                type: "",
                id: util_default.uuid(),
                blend: {
                  type: "",
                  id: util_default.uuid(),
                  min_features: [],
                  core_param,
                  ability_list: uploadedImageIds.map((imageId) => ({
                    type: "",
                    id: util_default.uuid(),
                    name: "byte_edit",
                    image_uri_list: [imageId],
                    image_list: [{
                      type: "image",
                      id: util_default.uuid(),
                      source_from: "upload",
                      platform_type: 1,
                      name: "",
                      image_uri: imageId,
                      width: 0,
                      height: 0,
                      format: "",
                      uri: imageId
                    }],
                    strength: 0.5
                  })),
                  prompt_placeholder_info_list: uploadedImageIds.map((_18, index) => ({
                    type: "",
                    id: util_default.uuid(),
                    ability_index: index
                  })),
                  postedit_param: {
                    type: "",
                    id: util_default.uuid(),
                    generate_type: 0
                  }
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      }
    }
  );
  const historyId = aigc_data == null ? void 0 : aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u56FE\u751F\u56FE\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0ChistoryId: ${historyId}\u3002\u8BF7\u901A\u8FC7historyId\u63A5\u53E3\u83B7\u53D6\u751F\u6210\u7ED3\u679C\u3002`);
  return { imageUrls: [], historyId };
}
async function generateImages(_model, prompt, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = ""
}, refreshToken) {
  const isUS = refreshToken.toLowerCase().startsWith("us-");
  const model = getModel(_model, isUS);
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} \u5206\u8FA8\u7387: ${resolution} \u6BD4\u4F8B: ${ratio} \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  const result = await generateImagesInternal(_model, prompt, { ratio, resolution, sampleStrength, negativePrompt }, refreshToken);
  return result;
}
async function generateImagesInternal(_model, prompt, {
  ratio,
  resolution,
  sampleStrength = 0.5,
  negativePrompt = ""
}, refreshToken) {
  const isUS = refreshToken.toLowerCase().startsWith("us-");
  const model = getModel(_model, isUS);
  let width, height, image_ratio, resolution_type;
  if (_model === "nanobanana") {
    logger_default.warn("nanobanana\u6A21\u578B\u5F53\u524D\u56FA\u5B9A\u4F7F\u75281024x1024\u5206\u8FA8\u7387\u548C2k\u7684\u6E05\u6670\u5EA6\uFF0C\u60A8\u8F93\u5165\u7684\u53C2\u6570\u5C06\u88AB\u5FFD\u7565\u3002");
    width = 1024;
    height = 1024;
    image_ratio = 1;
    resolution_type = "2k";
  } else {
    const params = getResolutionParams(resolution, ratio);
    width = params.width;
    height = params.height;
    image_ratio = params.image_ratio;
    resolution_type = params.resolution_type;
  }
  const { totalCredit, giftCredit, purchaseCredit, vipCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  logger_default.info(`\u5F53\u524D\u79EF\u5206\u72B6\u6001: \u603B\u8BA1=${totalCredit}, \u8D60\u9001=${giftCredit}, \u8D2D\u4E70=${purchaseCredit}, VIP=${vipCredit}`);
  const isJimeng40MultiImage = _model === "jimeng-4.0" && (prompt.includes("\u8FDE\u7EED") || prompt.includes("\u7ED8\u672C") || prompt.includes("\u6545\u4E8B") || /\d+张/.test(prompt));
  if (isJimeng40MultiImage) {
    return await generateJimeng40MultiImages(_model, prompt, { ratio, resolution, sampleStrength, negativePrompt }, refreshToken);
  }
  const componentId = util_default.uuid();
  const core_param = {
    type: "",
    id: util_default.uuid(),
    model,
    prompt,
    negative_prompt: negativePrompt,
    seed: Math.floor(Math.random() * 1e8) + 25e8,
    sample_strength: sampleStrength,
    image_ratio,
    large_image_info: {
      type: "",
      id: util_default.uuid(),
      height,
      width,
      resolution_type
    },
    intelligent_ratio: false
  };
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {},
      data: {
        extend: {
          root_model: model
        },
        submit_id: util_default.uuid(),
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          generateId: util_default.uuid(),
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util_default.uuid(),
                generate: {
                  type: "",
                  id: util_default.uuid(),
                  core_param
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      }
    }
  );
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u56FE\u7247\u751F\u6210\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0ChistoryId: ${historyId}\u3002\u8BF7\u901A\u8FC7historyId\u63A5\u53E3\u83B7\u53D6\u751F\u6210\u7ED3\u679C\u3002`);
  return { imageUrls: [], historyId };
}
async function generateJimeng40MultiImages(_model, prompt, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = ""
}, refreshToken) {
  const isUS = refreshToken.toLowerCase().startsWith("us-");
  const model = getModel(_model, isUS);
  const { width, height, image_ratio, resolution_type } = getResolutionParams(resolution, ratio);
  const targetImageCount = prompt.match(/(\d+)张/) ? parseInt(prompt.match(/(\d+)张/)[1]) : 4;
  logger_default.info(`\u4F7F\u7528 \u591A\u56FE\u751F\u6210: ${targetImageCount}\u5F20\u56FE\u7247 ${width}x${height} \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {},
      data: {
        extend: {
          root_model: model
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          templateId: "",
          generateCount: 1,
          promptSource: "custom",
          templateSource: "",
          lastRequestId: "",
          originRequestId: ""
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util_default.uuid(),
                generate: {
                  type: "",
                  id: util_default.uuid(),
                  core_param: {
                    type: "",
                    id: util_default.uuid(),
                    model,
                    prompt,
                    negative_prompt: negativePrompt,
                    seed: Math.floor(Math.random() * 1e8) + 25e8,
                    sample_strength: sampleStrength,
                    image_ratio,
                    large_image_info: {
                      type: "",
                      id: util_default.uuid(),
                      height,
                      width,
                      resolution_type
                    },
                    intelligent_ratio: false
                  }
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      }
    }
  );
  const historyId = aigc_data == null ? void 0 : aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u591A\u56FE\u751F\u6210\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0ChistoryId: ${historyId}\u3002\u8BF7\u901A\u8FC7historyId\u63A5\u53E3\u83B7\u53D6\u751F\u6210\u7ED3\u679C\u3002`);
  return { imageUrls: [], historyId };
}

// src/api/routes/images.ts
var images_default = {
  prefix: "/v1/images",
  post: {
    "/generations": async (request2) => {
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`\u4E0D\u652F\u6301\u7684\u53C2\u6570: ${foundUnsupported.join(", ")}\u3002\u8BF7\u4F7F\u7528 ratio \u548C resolution \u53C2\u6570\u63A7\u5236\u56FE\u50CF\u5C3A\u5BF8\u3002`);
      }
      if (bodyKeys.includes("images")) {
        throw new Error(`[\u63A5\u53E3\u4F7F\u7528\u9519\u8BEF]: /v1/images/generations \u63A5\u53E3\u7528\u4E8E\u751F\u6210\u65B0\u56FE\u7247\uFF0C\u4E0D\u5E94\u5305\u542B 'images' \u5B57\u6BB5\u3002\u5982\u9700\u56FE\u7247\u5408\u6210\uFF0C\u8BF7\u4F7F\u7528 /v1/images/compositions \u63A5\u53E3`);
      }
      request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format
      } = request2.body;
      const responseFormat = _13.defaultTo(response_format, "url");
      const result = await generateImages(model, prompt, {
        ratio,
        resolution,
        sampleStrength,
        negativePrompt,
        intelligentRatio
      }, token);
      const imageUrls = result.imageUrls;
      const historyId = result.historyId;
      return {
        created: util_default.unixTimestamp(),
        data: {
          historyId
        }
      };
    },
    "/compositions": async (request2) => {
      var _a;
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`\u4E0D\u652F\u6301\u7684\u53C2\u6570: ${foundUnsupported.join(", ")}\u3002\u8BF7\u4F7F\u7528 ratio \u548C resolution \u53C2\u6570\u63A7\u5236\u56FE\u50CF\u5C3A\u5BF8\u3002`);
      }
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      if (isMultiPart) {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || typeof v === "string" && (v === "true" || v === "false") || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || typeof v === "string" && !isNaN(parseFloat(v)) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      } else {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.images", _13.isArray).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      }
      let images = [];
      if (isMultiPart) {
        const files = (_a = request2.files) == null ? void 0 : _a.images;
        if (!files) {
          throw new Error("\u5728form-data\u4E2D\u7F3A\u5C11 'images' \u5B57\u6BB5");
        }
        const imageFiles = Array.isArray(files) ? files : [files];
        if (imageFiles.length === 0) {
          throw new Error("\u81F3\u5C11\u9700\u8981\u63D0\u4F9B1\u5F20\u8F93\u5165\u56FE\u7247");
        }
        if (imageFiles.length > 10) {
          throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
        }
        images = imageFiles.map((file) => fs6.readFileSync(file.filepath));
      } else {
        const bodyImages = request2.body.images;
        if (!bodyImages || bodyImages.length === 0) {
          throw new Error("\u81F3\u5C11\u9700\u8981\u63D0\u4F9B1\u5F20\u8F93\u5165\u56FE\u7247");
        }
        if (bodyImages.length > 10) {
          throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
        }
        bodyImages.forEach((image, index) => {
          if (!_13.isString(image) && !_13.isObject(image)) {
            throw new Error(`\u56FE\u7247 ${index + 1} \u683C\u5F0F\u4E0D\u6B63\u786E\uFF1A\u5E94\u4E3AURL\u5B57\u7B26\u4E32\u6216\u5305\u542Burl\u5B57\u6BB5\u7684\u5BF9\u8C61`);
          }
          if (_13.isObject(image) && !image.url) {
            throw new Error(`\u56FE\u7247 ${index + 1} \u7F3A\u5C11url\u5B57\u6BB5`);
          }
        });
        images = bodyImages.map((image) => _13.isString(image) ? image : image.url);
      }
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format
      } = request2.body;
      const finalModel = _13.defaultTo(model, DEFAULT_IMAGE_MODEL);
      const finalSampleStrength = isMultiPart && typeof sampleStrength === "string" ? parseFloat(sampleStrength) : sampleStrength;
      const finalIntelligentRatio = isMultiPart && typeof intelligentRatio === "string" ? intelligentRatio === "true" : intelligentRatio;
      const responseFormat = _13.defaultTo(response_format, "url");
      const result = await generateImageComposition(finalModel, prompt, images, {
        ratio,
        resolution,
        sampleStrength: finalSampleStrength,
        negativePrompt,
        intelligentRatio: finalIntelligentRatio
      }, token);
      let data = [];
      if (responseFormat == "b64_json") {
        data = (await Promise.all(result.imageUrls.map((url) => util_default.fetchFileBASE64(url)))).map((b64) => ({ b64_json: b64 }));
      } else {
        data = result.imageUrls.map((url) => ({
          url
        }));
      }
      return {
        created: util_default.unixTimestamp(),
        data: {
          historyId: result.historyId
        }
      };
    },
    "/get_history_by_ids": async (request2) => {
      request2.validate("body.history_ids", (v) => _13.isArray(v) || _13.isString(v), 'history_ids \u5FC5\u987B\u662F\u6570\u7EC4\u683C\u5F0F\uFF08\u5982 ["id1", "id2"]\uFF09\u6216\u5B57\u7B26\u4E32\u683C\u5F0F\uFF08\u5982 "id1"\uFF09').validate("headers.authorization", _13.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      let { history_ids } = request2.body;
      if (_13.isString(history_ids)) {
        history_ids = [history_ids];
      }
      if (!history_ids || history_ids.length === 0) {
        throw new Error("\u5FC5\u987B\u63D0\u4F9B\u81F3\u5C11\u4E00\u4E2A\u5386\u53F2\u8BB0\u5F55ID");
      }
      if (history_ids.length > 50) {
        throw new Error("\u6700\u591A\u652F\u630150\u4E2A\u5386\u53F2\u8BB0\u5F55ID");
      }
      for (const id of history_ids) {
        if (!_13.isString(id)) {
          throw new Error("\u5386\u53F2\u8BB0\u5F55ID\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B");
        }
      }
      const result = await getImagesByHistoryIds(history_ids, token);
      const responseFormat = _13.defaultTo(request2.body.response_format, "url");
      let allImages = [];
      for (const historyId of history_ids) {
        const historyResult = result[historyId];
        if (historyResult.error) {
          console.warn(`\u5386\u53F2\u8BB0\u5F55 ${historyId} \u67E5\u8BE2\u5931\u8D25:`, historyResult.error);
          continue;
        }
        if (responseFormat === "b64_json") {
          const b64Images = await Promise.all(historyResult.images.map(async (imageObj) => {
            const imageUrl = imageObj.largeimg || imageObj.webp || imageObj.cover || imageObj.jpeg;
            if (!imageUrl) return { b64_json: null };
            try {
              const b64 = await util_default.fetchFileBASE64(imageUrl);
              return { b64_json: b64 };
            } catch (error) {
              console.error(`\u8F6C\u6362\u56FE\u7247URL\u4E3Abase64\u5931\u8D25: ${error.message}`);
              return { b64_json: null };
            }
          }));
          allImages = allImages.concat(b64Images);
        } else {
          const urlImages = historyResult.images.map((imageObj) => ({
            webp: imageObj.webp || "",
            cover: imageObj.cover || "",
            png: imageObj.png || imageObj.largeimg || "",
            large: imageObj.large || imageObj.largeimg || ""
          }));
          allImages = allImages.concat(urlImages);
        }
      }
      return {
        created: util_default.unixTimestamp(),
        data: allImages
      };
    }
  },
  get: {
    "/history/:id": async (request2) => {
      request2.validate("params.id", _13.isString).validate("headers.authorization", _13.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const historyId = request2.params.id;
      const result = await getImageByHistoryId(historyId, token);
      const images = result.images || [];
      return {
        created: util_default.unixTimestamp(),
        data: images.map((imageObj) => ({
          webp: imageObj.webp || "",
          cover: imageObj.cover || "",
          png: imageObj.png || "",
          large: imageObj.large || ""
        }))
      };
    },
    "/assets/:id": async (request2) => {
      request2.validate("params.id", _13.isString).validate("headers.authorization", _13.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const historyId = request2.params.id;
      const assets = await getAssetList(token);
      return {
        created: util_default.unixTimestamp(),
        data: assets
      };
    }
  }
};

// src/api/routes/chat.ts
import _15 from "lodash";

// src/api/controllers/chat.ts
import { PassThrough } from "stream";

// src/api/controllers/videos.ts
import _14 from "lodash";
import fs7 from "fs-extra";

// src/lib/smart-poller.ts
var SmartPoller = class {
  pollCount = 0;
  startTime = Date.now();
  lastItemCount = 0;
  stableItemCountRounds = 0;
  options;
  constructor(options = {}) {
    this.options = {
      maxPollCount: options.maxPollCount ?? POLLING_CONFIG.MAX_POLL_COUNT,
      pollInterval: options.pollInterval ?? POLLING_CONFIG.POLL_INTERVAL,
      stableRounds: options.stableRounds ?? POLLING_CONFIG.STABLE_ROUNDS,
      timeoutSeconds: options.timeoutSeconds ?? POLLING_CONFIG.TIMEOUT_SECONDS,
      expectedItemCount: options.expectedItemCount ?? 4,
      type: options.type ?? "image"
    };
  }
  /**
   * 获取状态名称
   */
  getStatusName(status) {
    return STATUS_CODE_MAP[status] || `UNKNOWN(${status})`;
  }
  /**
   * 根据状态码计算智能轮询间隔
   */
  getSmartInterval(status, itemCount) {
    const baseInterval = this.options.pollInterval;
    switch (status) {
      case 20:
        return baseInterval;
      case 42:
        return baseInterval * 1.2;
      case 45:
        return baseInterval * 1.5;
      case 50:
        return baseInterval * 0.5;
      case 10:
        return 0;
      case 30:
        return 0;
      default:
        return baseInterval;
    }
  }
  /**
   * 检查是否应该退出轮询
   */
  shouldExitPolling(pollingStatus) {
    const { status, itemCount } = pollingStatus;
    const elapsedTime = Math.round((Date.now() - this.startTime) / 1e3);
    if (itemCount === this.lastItemCount) {
      this.stableItemCountRounds++;
    } else {
      this.stableItemCountRounds = 0;
      this.lastItemCount = itemCount;
    }
    if (status === 10 || status === 50) {
      return { shouldExit: true, reason: "\u4EFB\u52A1\u6210\u529F\u5B8C\u6210" };
    }
    if (status === 30) {
      return { shouldExit: true, reason: "\u4EFB\u52A1\u5931\u8D25" };
    }
    if (itemCount >= this.options.expectedItemCount && (status === 10 || status === 50)) {
      return { shouldExit: true, reason: `\u5DF2\u83B7\u5F97\u5B8C\u6574\u7ED3\u679C\u96C6(${itemCount}/${this.options.expectedItemCount})` };
    }
    if (this.stableItemCountRounds >= this.options.stableRounds && itemCount > 0) {
      return { shouldExit: true, reason: `\u7ED3\u679C\u6570\u91CF\u7A33\u5B9A(${this.stableItemCountRounds}\u8F6E)` };
    }
    if (this.pollCount >= this.options.maxPollCount) {
      return { shouldExit: true, reason: "\u8F6E\u8BE2\u6B21\u6570\u8D85\u9650" };
    }
    if (elapsedTime >= this.options.timeoutSeconds && itemCount > 0) {
      return { shouldExit: true, reason: "\u65F6\u95F4\u8D85\u9650\u4F46\u5DF2\u6709\u7ED3\u679C" };
    }
    return { shouldExit: false, reason: "" };
  }
  /**
   * 执行单次轮询检查
   */
  async poll(pollFunction, historyId) {
    logger_default.info(`\u5F00\u59CB\u667A\u80FD\u8F6E\u8BE2: historyId=${historyId || "N/A"}, \u6700\u5927\u8F6E\u8BE2\u6B21\u6570=${this.options.maxPollCount}, \u671F\u671B\u7ED3\u679C\u6570=${this.options.expectedItemCount}`);
    let lastData;
    let lastStatus = { status: 20, itemCount: 0 };
    while (true) {
      this.pollCount++;
      const elapsedTime = Math.round((Date.now() - this.startTime) / 1e3);
      try {
        const { status, data } = await pollFunction();
        lastStatus = status;
        lastData = data;
        logger_default.info(`\u8F6E\u8BE2 ${this.pollCount}/${this.options.maxPollCount}: status=${status.status}(${this.getStatusName(status.status)}), failCode=${status.failCode || "none"}, items=${status.itemCount}, elapsed=${elapsedTime}s, finish_time=${status.finishTime || 0}, stable=${this.stableItemCountRounds}/${this.options.stableRounds}`);
        if (status.itemCount > 0) {
          logger_default.info(`\u68C0\u6D4B\u5230${this.options.type === "image" ? "\u56FE\u7247" : "\u89C6\u9891"}\u751F\u6210: \u6570\u91CF=${status.itemCount}, \u72B6\u6001=${this.getStatusName(status.status)}`);
        }
        const { shouldExit, reason } = this.shouldExitPolling(status);
        if (shouldExit) {
          logger_default.info(`\u9000\u51FA\u8F6E\u8BE2: ${reason}, \u6700\u7EC8${this.options.type === "image" ? "\u56FE\u7247" : "\u89C6\u9891"}\u6570\u91CF=${status.itemCount}`);
          if (status.status === 30) {
            handleGenerationFailure(status.status, status.failCode, historyId, this.options.type, status.itemCount);
          }
          if (reason === "\u8F6E\u8BE2\u6B21\u6570\u8D85\u9650" || reason === "\u65F6\u95F4\u8D85\u9650\u4F46\u5DF2\u6709\u7ED3\u679C") {
            handlePollingTimeout(
              this.pollCount,
              this.options.maxPollCount,
              elapsedTime,
              status.status,
              status.itemCount,
              historyId
            );
          }
          break;
        }
        if (![20, 42, 45, 10, 30, 50].includes(status.status)) {
          logger_default.warn(`\u68C0\u6D4B\u5230\u672A\u77E5\u72B6\u6001\u7801 ${status.status}(${this.getStatusName(status.status)})\uFF0C\u7EE7\u7EED\u8F6E\u8BE2\u7B49\u5F85\u751F\u6210...`);
        }
        if (this.pollCount % 30 === 0) {
          logger_default.info(`${this.options.type === "image" ? "\u56FE\u50CF" : "\u89C6\u9891"}\u751F\u6210\u8FDB\u5EA6: \u7B2C ${this.pollCount} \u6B21\u8F6E\u8BE2\uFF0C\u72B6\u6001: ${this.getStatusName(status.status)}\uFF0C\u5DF2\u7B49\u5F85 ${elapsedTime} \u79D2...`);
        }
        const nextInterval = this.getSmartInterval(status.status, status.itemCount);
        if (nextInterval > 0) {
          await new Promise((resolve) => setTimeout(resolve, nextInterval));
        }
      } catch (error) {
        logger_default.error(`\u8F6E\u8BE2\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF: ${error.message}`);
        throw error;
      }
    }
    const finalElapsedTime = Math.round((Date.now() - this.startTime) / 1e3);
    const result = {
      status: lastStatus.status,
      failCode: lastStatus.failCode,
      itemCount: lastStatus.itemCount,
      elapsedTime: finalElapsedTime,
      pollCount: this.pollCount,
      exitReason: this.shouldExitPolling(lastStatus).reason
    };
    logger_default.info(`${this.options.type === "image" ? "\u56FE\u50CF" : "\u89C6\u9891"}\u751F\u6210\u5B8C\u6210: \u6210\u529F\u751F\u6210 ${lastStatus.itemCount} \u4E2A\u7ED3\u679C\uFF0C\u603B\u8017\u65F6 ${finalElapsedTime} \u79D2\uFF0C\u6700\u7EC8\u72B6\u6001: ${this.getStatusName(lastStatus.status)}`);
    return { result, data: lastData };
  }
};

// src/lib/image-uploader.ts
import crypto4 from "crypto";

// src/lib/region-utils.ts
var RegionUtils = class {
  /**
   * 获取ServiceId
   */
  static getServiceId(regionInfo, providedServiceId) {
    if (providedServiceId) {
      return providedServiceId;
    }
    if (regionInfo.isUS || regionInfo.isHK || regionInfo.isJP || regionInfo.isSG) {
      return "wopfjsm1ax";
    }
    return "tb4s082cfz";
  }
  /**
   * 获取ImageX URL
   */
  static getImageXUrl(regionInfo) {
    if (regionInfo.isUS) {
      return BASE_URL_IMAGEX_US;
    }
    if (regionInfo.isHK || regionInfo.isJP || regionInfo.isSG) {
      return BASE_URL_IMAGEX_HK;
    }
    return "https://imagex.bytedanceapi.com";
  }
  /**
   * 获取Origin
   */
  static getOrigin(regionInfo) {
    if (regionInfo.isUS) {
      return new URL(BASE_URL_DREAMINA_US).origin;
    }
    if (regionInfo.isHK || regionInfo.isJP || regionInfo.isSG) {
      return new URL(BASE_URL_DREAMINA_HK).origin;
    }
    return "https://jimeng.jianying.com";
  }
  /**
   * 获取AWS区域
   */
  static getAWSRegion(regionInfo) {
    if (regionInfo.isUS) {
      return "us-east-1";
    }
    if (regionInfo.isHK || regionInfo.isJP || regionInfo.isSG) {
      return "ap-southeast-1";
    }
    return "cn-north-1";
  }
  /**
   * 获取Referer路径
   */
  static getRefererPath(regionInfo, path6 = "/ai-tool/generate") {
    const origin = this.getOrigin(regionInfo);
    return `${origin}${path6}`;
  }
};

// src/lib/image-uploader.ts
async function uploadImageBuffer(imageBuffer, refreshToken, regionInfo) {
  var _a, _b, _c, _d;
  try {
    logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u56FE\u7247Buffer... (isInternational: ${regionInfo.isInternational})`);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
        // AIGC 图片上传场景
      }
    });
    const { access_key_id, secret_access_key, session_token } = tokenResult;
    const service_id = regionInfo.isInternational ? tokenResult.space_name : tokenResult.service_id;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25");
    }
    const actualServiceId = RegionUtils.getServiceId(regionInfo, service_id);
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: service_id=${actualServiceId}`);
    const fileSize = imageBuffer.byteLength;
    const crc32 = util_default.calculateCRC32(imageBuffer);
    logger_default.info(`\u56FE\u7247Buffer: \u5927\u5C0F=${fileSize}\u5B57\u8282, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrlHost = RegionUtils.getImageXUrl(regionInfo);
    const applyUrl = `${applyUrlHost}/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}${regionInfo.isInternational ? "&device_platform=web" : ""}`;
    const awsRegion = RegionUtils.getAWSRegion(regionInfo);
    const origin = RegionUtils.getOrigin(regionInfo);
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token, "", awsRegion);
    logger_default.info(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650: ${applyUrl}`);
    let applyResponse;
    try {
      applyResponse = await fetch(applyUrl, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "accept-language": "zh-CN,zh;q=0.9",
          "authorization": authorization,
          "origin": origin,
          "referer": `${origin}/ai-tool/generate`,
          "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          "x-amz-date": timestamp,
          "x-amz-security-token": session_token
        }
      });
    } catch (fetchError) {
      logger_default.error(`Fetch\u8BF7\u6C42\u5931\u8D25\uFF0C\u76EE\u6807URL: ${applyUrl}`);
      logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${fetchError.message}`);
      throw new Error(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25 (${applyUrlHost}): ${fetchError.message}. \u8BF7\u68C0\u67E5: 1) \u7F51\u7EDC\u8FDE\u63A5\u662F\u5426\u6B63\u5E38 2) \u662F\u5426\u9700\u8981\u914D\u7F6E\u4EE3\u7406 3) DNS\u662F\u5426\u80FD\u89E3\u6790\u8BE5\u57DF\u540D`);
    }
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${applyResponse.status} - ${errorText}`);
    }
    const applyResult = await applyResponse.json();
    if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }
    logger_default.info(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u6210\u529F`);
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`\u83B7\u53D6\u4E0A\u4F20\u5730\u5740\u5931\u8D25: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    logger_default.info(`\u51C6\u5907\u4E0A\u4F20\u56FE\u7247: uploadUrl=${uploadUrl}`);
    let uploadResponse;
    try {
      uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Accept": "*/*",
          "Accept-Language": "zh-CN,zh;q=0.9",
          "Authorization": auth,
          "Connection": "keep-alive",
          "Content-CRC32": crc32,
          "Content-Disposition": 'attachment; filename="undefined"',
          "Content-Type": "application/octet-stream",
          "Origin": origin,
          "Referer": RegionUtils.getRefererPath(regionInfo),
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
        },
        body: imageBuffer
      });
    } catch (fetchError) {
      logger_default.error(`\u56FE\u7247\u6587\u4EF6\u4E0A\u4F20fetch\u8BF7\u6C42\u5931\u8D25\uFF0C\u76EE\u6807URL: ${uploadUrl}`);
      logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${fetchError.message}`);
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25 (${uploadHost}): ${fetchError.message}. \u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5`);
    }
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`\u56FE\u7247\u6587\u4EF6\u4E0A\u4F20\u6210\u529F`);
    const commitUrl = `${applyUrlHost}/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey
    });
    const payloadHash = crypto4.createHash("sha256").update(commitPayload, "utf8").digest("hex");
    const commitRequestHeaders = {
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    };
    const commitAuthorization = createSignature("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload, awsRegion);
    let commitResponse;
    try {
      commitResponse = await fetch(commitUrl, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "accept-language": "zh-CN,zh;q=0.9",
          "authorization": commitAuthorization,
          "content-type": "application/json",
          "origin": origin,
          "referer": RegionUtils.getRefererPath(regionInfo),
          "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          "x-amz-date": commitTimestamp,
          "x-amz-security-token": session_token,
          "x-amz-content-sha256": payloadHash
        },
        body: commitPayload
      });
    } catch (fetchError) {
      logger_default.error(`\u63D0\u4EA4\u4E0A\u4F20fetch\u8BF7\u6C42\u5931\u8D25\uFF0C\u76EE\u6807URL: ${commitUrl}`);
      logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${fetchError.message}`);
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25 (${applyUrlHost}): ${fetchError.message}. \u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5`);
    }
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${commitResponse.status} - ${errorText}`);
    }
    const commitResult = await commitResponse.json();
    if ((_c = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _c.Error) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!((_d = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _d.Results) || commitResult.Result.Results.length === 0) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u54CD\u5E94\u7F3A\u5C11\u7ED3\u679C: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2e3) {
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u72B6\u6001\u5F02\u5E38: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`\u56FE\u7247Buffer\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}

// src/lib/image-utils.ts
function extractVideoUrl(item) {
  var _a, _b, _c, _d, _e, _f;
  if ((_c = (_b = (_a = item == null ? void 0 : item.video) == null ? void 0 : _a.transcoded_video) == null ? void 0 : _b.origin) == null ? void 0 : _c.video_url) {
    return item.video.transcoded_video.origin.video_url;
  }
  if ((_d = item == null ? void 0 : item.video) == null ? void 0 : _d.play_url) {
    return item.video.play_url;
  }
  if ((_e = item == null ? void 0 : item.video) == null ? void 0 : _e.download_url) {
    return item.video.download_url;
  }
  if ((_f = item == null ? void 0 : item.video) == null ? void 0 : _f.url) {
    return item.video.url;
  }
  return null;
}

// src/api/controllers/videos.ts
var DEFAULT_MODEL2 = DEFAULT_VIDEO_MODEL;
function getModel2(model) {
  return VIDEO_MODEL_MAP[model] || VIDEO_MODEL_MAP[DEFAULT_MODEL2];
}
async function uploadImageFromFile(file, refreshToken, regionInfo) {
  try {
    logger_default.info(`\u5F00\u59CB\u4ECE\u672C\u5730\u6587\u4EF6\u4E0A\u4F20\u89C6\u9891\u56FE\u7247: ${file.originalFilename} (\u8DEF\u5F84: ${file.filepath})`);
    const imageBuffer = await fs7.readFile(file.filepath);
    return await uploadImageBuffer(imageBuffer, refreshToken, regionInfo);
  } catch (error) {
    logger_default.error(`\u4ECE\u672C\u5730\u6587\u4EF6\u4E0A\u4F20\u89C6\u9891\u56FE\u7247\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function uploadImageFromUrl2(imageUrl, refreshToken, regionInfo) {
  try {
    logger_default.info(`\u5F00\u59CB\u4ECEURL\u4E0B\u8F7D\u5E76\u4E0A\u4F20\u89C6\u9891\u56FE\u7247: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    return await uploadImageBuffer(imageBuffer, refreshToken, regionInfo);
  } catch (error) {
    logger_default.error(`\u4ECEURL\u4E0A\u4F20\u89C6\u9891\u56FE\u7247\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function generateVideo(_model, prompt, {
  ratio = "1:1",
  resolution = "720p",
  duration = 5,
  filePaths = [],
  files = {}
}, refreshToken) {
  const regionInfo = parseRegionFromToken(refreshToken);
  const { isInternational } = regionInfo;
  logger_default.info(`\u89C6\u9891\u751F\u6210\u533A\u57DF\u68C0\u6D4B: isInternational=${isInternational}`);
  const model = getModel2(_model);
  const durationMs = duration === 10 ? 1e4 : 5e3;
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} \u6BD4\u4F8B: ${ratio} \u5206\u8FA8\u7387: ${resolution} \u65F6\u957F: ${duration}s`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  let first_frame_image = void 0;
  let end_frame_image = void 0;
  let uploadIDs = [];
  const uploadedFiles = _14.values(files);
  if (uploadedFiles && uploadedFiles.length > 0) {
    logger_default.info(`\u68C0\u6D4B\u5230 ${uploadedFiles.length} \u4E2A\u672C\u5730\u4E0A\u4F20\u6587\u4EF6\uFF0C\u4F18\u5148\u5904\u7406`);
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (!file) continue;
      try {
        logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u5F20\u672C\u5730\u56FE\u7247: ${file.originalFilename}`);
        const imageUri = await uploadImageFromFile(file, refreshToken, regionInfo);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`\u7B2C ${i + 1} \u5F20\u672C\u5730\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
        } else {
          logger_default.error(`\u7B2C ${i + 1} \u5F20\u672C\u5730\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: \u672A\u83B7\u53D6\u5230 image_uri`);
        }
      } catch (error) {
        logger_default.error(`\u7B2C ${i + 1} \u5F20\u672C\u5730\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        }
      }
    }
  } else if (filePaths && filePaths.length > 0) {
    logger_default.info(`\u672A\u68C0\u6D4B\u5230\u672C\u5730\u4E0A\u4F20\u6587\u4EF6\uFF0C\u5904\u7406 ${filePaths.length} \u4E2A\u56FE\u7247URL`);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (!filePath) {
        logger_default.warn(`\u7B2C ${i + 1} \u4E2A\u56FE\u7247URL\u4E3A\u7A7A\uFF0C\u8DF3\u8FC7`);
        continue;
      }
      try {
        logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u4E2AURL\u56FE\u7247: ${filePath}`);
        const imageUri = await uploadImageFromUrl2(filePath, refreshToken, regionInfo);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`\u7B2C ${i + 1} \u4E2AURL\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
        } else {
          logger_default.error(`\u7B2C ${i + 1} \u4E2AURL\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: \u672A\u83B7\u53D6\u5230 image_uri`);
        }
      } catch (error) {
        logger_default.error(`\u7B2C ${i + 1} \u4E2AURL\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        }
      }
    }
  } else {
    logger_default.info(`\u672A\u63D0\u4F9B\u56FE\u7247\u6587\u4EF6\u6216URL\uFF0C\u5C06\u8FDB\u884C\u7EAF\u6587\u672C\u89C6\u9891\u751F\u6210`);
  }
  if (uploadIDs.length > 0) {
    logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210\uFF0C\u5171\u6210\u529F ${uploadIDs.length} \u5F20`);
    if (uploadIDs[0]) {
      first_frame_image = {
        format: "",
        height: 0,
        id: util_default.uuid(),
        image_uri: uploadIDs[0],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[0],
        width: 0
      };
      logger_default.info(`\u8BBE\u7F6E\u9996\u5E27\u56FE\u7247: ${uploadIDs[0]}`);
    }
    if (uploadIDs[1]) {
      end_frame_image = {
        format: "",
        height: 0,
        id: util_default.uuid(),
        image_uri: uploadIDs[1],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[1],
        width: 0
      };
      logger_default.info(`\u8BBE\u7F6E\u5C3E\u5E27\u56FE\u7247: ${uploadIDs[1]}`);
    }
  }
  const componentId = util_default.uuid();
  const originSubmitId = util_default.uuid();
  const functionMode = "first_last_frames";
  const metricsExtra = JSON.stringify({
    "promptSource": "custom",
    "isDefaultSeed": 1,
    "originSubmitId": originSubmitId,
    "isRegenerate": false,
    "enterFrom": "click",
    "functionMode": functionMode
  });
  const hasImageInput = uploadIDs.length > 0;
  if (hasImageInput && ratio !== "1:1") {
    logger_default.warn(`\u56FE\u751F\u89C6\u9891\u6A21\u5F0F\u4E0B\uFF0Cratio\u53C2\u6570\u5C06\u88AB\u5FFD\u7565\uFF08\u7531\u8F93\u5165\u56FE\u7247\u7684\u5B9E\u9645\u6BD4\u4F8B\u51B3\u5B9A\uFF09\uFF0C\u4F46resolution\u53C2\u6570\u4ECD\u7136\u6709\u6548`);
  }
  logger_default.info(`\u89C6\u9891\u751F\u6210\u6A21\u5F0F: ${uploadIDs.length}\u5F20\u56FE\u7247 (\u9996\u5E27: ${!!first_frame_image}, \u5C3E\u5E27: ${!!end_frame_image}), resolution: ${resolution}`);
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {
        aigc_features: "app_lip_sync",
        web_version: "7.5.0",
        da_version: DRAFT_VERSION
      },
      data: {
        "extend": {
          "root_model": end_frame_image ? VIDEO_MODEL_MAP["jimeng-video-3.0"] : model,
          "m_video_commerce_info": {
            benefit_type: "basic_video_operation_vgfm_v_three",
            resource_id: "generate_video",
            resource_id_type: "str",
            resource_sub_type: "aigc"
          },
          "m_video_commerce_info_list": [{
            benefit_type: "basic_video_operation_vgfm_v_three",
            resource_id: "generate_video",
            resource_id_type: "str",
            resource_sub_type: "aigc"
          }]
        },
        "submit_id": util_default.uuid(),
        "metrics_extra": metricsExtra,
        "draft_content": JSON.stringify({
          "type": "draft",
          "id": util_default.uuid(),
          "min_version": "3.0.5",
          "min_features": [],
          "is_from_tsn": true,
          "version": DRAFT_VERSION,
          "main_component_id": componentId,
          "component_list": [{
            "type": "video_base_component",
            "id": componentId,
            "min_version": "1.0.0",
            "aigc_mode": "workbench",
            "metadata": {
              "type": "",
              "id": util_default.uuid(),
              "created_platform": 3,
              "created_platform_version": "",
              "created_time_in_ms": Date.now().toString(),
              "created_did": ""
            },
            "generate_type": "gen_video",
            "abilities": {
              "type": "",
              "id": util_default.uuid(),
              "gen_video": {
                "id": util_default.uuid(),
                "type": "",
                "text_to_video_params": {
                  "type": "",
                  "id": util_default.uuid(),
                  "video_gen_inputs": [{
                    "type": "",
                    "id": util_default.uuid(),
                    "min_version": "3.0.5",
                    "prompt": prompt,
                    "video_mode": 2,
                    "fps": 24,
                    "duration_ms": durationMs,
                    "resolution": resolution,
                    "first_frame_image": first_frame_image,
                    "end_frame_image": end_frame_image,
                    "idip_meta_list": []
                  }],
                  "video_aspect_ratio": ratio,
                  "seed": Math.floor(Math.random() * 1e8) + 25e8,
                  "model_req_key": model,
                  "priority": 0
                },
                "video_task_extra": metricsExtra
              }
            },
            "process_type": 1
          }]
        }),
        http_common_info: {
          aid: getAssistantId(regionInfo)
        }
      }
    }
  );
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u89C6\u9891\u751F\u6210\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0Chistory_id: ${historyId}\uFF0C\u7B49\u5F85\u751F\u6210\u5B8C\u6210...`);
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  const maxPollCount = 900;
  let pollAttempts = 0;
  const poller = new SmartPoller({
    maxPollCount,
    pollInterval: 2e3,
    // 2秒基础间隔
    expectedItemCount: 1,
    type: "video",
    timeoutSeconds: 1200
    // 20分钟超时
  });
  const { result: pollingResult, data: finalHistoryData } = await poller.poll(async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    pollAttempts++;
    const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: {
        history_ids: [historyId]
      }
    });
    const responseStr = JSON.stringify(result);
    const videoUrlMatch = responseStr.match(/https:\/\/v[0-9]+-artist\.vlabvod\.com\/[^"\s]+/);
    if (videoUrlMatch && videoUrlMatch[0]) {
      logger_default.info(`\u4ECEAPI\u54CD\u5E94\u4E2D\u76F4\u63A5\u63D0\u53D6\u5230\u89C6\u9891URL: ${videoUrlMatch[0]}`);
      return {
        status: {
          status: 10,
          itemCount: 1,
          historyId
        },
        data: {
          status: 10,
          item_list: [{
            video: {
              transcoded_video: {
                origin: {
                  video_url: videoUrlMatch[0]
                }
              }
            }
          }]
        }
      };
    }
    if (!result[historyId]) {
      logger_default.warn(`API\u672A\u8FD4\u56DE\u5386\u53F2\u8BB0\u5F55\uFF0ChistoryId: ${historyId}`);
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55\u4E0D\u5B58\u5728");
    }
    const historyData = result[historyId];
    const currentStatus = historyData.status;
    const currentFailCode = historyData.fail_code;
    const currentItemList = historyData.item_list || [];
    const finishTime = ((_a = historyData.task) == null ? void 0 : _a.finish_time) || 0;
    if (currentItemList.length > 0) {
      const tempVideoUrl = ((_e = (_d = (_c = (_b = currentItemList[0]) == null ? void 0 : _b.video) == null ? void 0 : _c.transcoded_video) == null ? void 0 : _d.origin) == null ? void 0 : _e.video_url) || ((_g = (_f = currentItemList[0]) == null ? void 0 : _f.video) == null ? void 0 : _g.play_url) || ((_i = (_h = currentItemList[0]) == null ? void 0 : _h.video) == null ? void 0 : _i.download_url) || ((_k = (_j = currentItemList[0]) == null ? void 0 : _j.video) == null ? void 0 : _k.url);
      if (tempVideoUrl) {
        logger_default.info(`\u68C0\u6D4B\u5230\u89C6\u9891URL: ${tempVideoUrl}`);
      }
    }
    return {
      status: {
        status: currentStatus,
        failCode: currentFailCode,
        itemCount: currentItemList.length,
        finishTime,
        historyId
      },
      data: historyData
    };
  }, historyId);
  const item_list = finalHistoryData.item_list || [];
  let videoUrl = (item_list == null ? void 0 : item_list[0]) ? extractVideoUrl(item_list[0]) : null;
  if (!videoUrl) {
    logger_default.error(`\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL\uFF0Citem_list: ${JSON.stringify(item_list)}`);
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL\uFF0C\u8BF7\u7A0D\u540E\u67E5\u770B");
  }
  logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}\uFF0C\u603B\u8017\u65F6: ${pollingResult.elapsedTime}\u79D2`);
  return videoUrl;
}

// src/api/controllers/chat.ts
function parseModel(model) {
  const [_model, size] = model.split(":");
  const [_18, width, height] = /(\d+)[\W\w](\d+)/.exec(size) ?? [];
  return {
    model: _model,
    width: size ? Math.ceil(parseInt(width) / 2) * 2 : 1024,
    height: size ? Math.ceil(parseInt(height) / 2) * 2 : 1024
  };
}
function isVideoModel(model) {
  return model.startsWith("jimeng-video");
}
async function createCompletion(messages, refreshToken, _model = DEFAULT_MODEL, retryCount = 0) {
  return (async () => {
    if (messages.length === 0)
      throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, "\u6D88\u606F\u4E0D\u80FD\u4E3A\u7A7A");
    const { model, width, height } = parseModel(_model);
    logger_default.info(messages);
    if (isVideoModel(_model)) {
      try {
        logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u6A21\u578B: ${_model}`);
        const videoUrl = await generateVideo(
          _model,
          messages[messages.length - 1].content,
          {
            width,
            height,
            resolution: "720p"
            // 默认分辨率
          },
          refreshToken
        );
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
        return {
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: `![video](${videoUrl})
`
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          created: util_default.unixTimestamp()
        };
      } catch (error) {
        logger_default.error(`\u89C6\u9891\u751F\u6210\u5931\u8D25: ${error.message}`);
        if (error instanceof APIException) {
          throw error;
        }
        return {
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: `\u751F\u6210\u89C6\u9891\u5931\u8D25: ${error.message}

\u5982\u679C\u60A8\u5728\u5373\u68A6\u5B98\u7F51\u770B\u5230\u5DF2\u751F\u6210\u7684\u89C6\u9891\uFF0C\u53EF\u80FD\u662F\u83B7\u53D6\u7ED3\u679C\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\uFF0C\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u3002`
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          created: util_default.unixTimestamp()
        };
      }
    } else {
      const imageUrls = await generateImages(
        model,
        messages[messages.length - 1].content,
        {
          width,
          height
        },
        refreshToken
      );
      return {
        id: util_default.uuid(),
        model: _model || model,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: imageUrls.reduce(
                (acc, url, i) => acc + `![image_${i}](${url})
`,
                ""
              )
            },
            finish_reason: "stop"
          }
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        created: util_default.unixTimestamp()
      };
    }
  })().catch((err) => {
    if (retryCount < RETRY_CONFIG.MAX_RETRY_COUNT) {
      logger_default.error(`Response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_CONFIG.RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY));
        return createCompletion(messages, refreshToken, _model, retryCount + 1);
      })();
    }
    throw err;
  });
}
async function createCompletionStream(messages, refreshToken, _model = DEFAULT_MODEL, retryCount = 0) {
  return (async () => {
    const { model, width, height } = parseModel(_model);
    logger_default.info(messages);
    const stream = new PassThrough();
    if (messages.length === 0) {
      logger_default.warn("\u6D88\u606F\u4E3A\u7A7A\uFF0C\u8FD4\u56DE\u7A7A\u6D41");
      stream.end("data: [DONE]\n\n");
      return stream;
    }
    if (isVideoModel(_model)) {
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "\u{1F3AC} \u89C6\u9891\u751F\u6210\u4E2D\uFF0C\u8BF7\u7A0D\u5019...\n\u8FD9\u53EF\u80FD\u9700\u89811-2\u5206\u949F\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85" },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u63D0\u793A\u8BCD: ${messages[messages.length - 1].content}`);
      const progressInterval = setInterval(() => {
        if (stream.destroyed) {
          clearInterval(progressInterval);
          return;
        }
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 0,
                delta: { role: "assistant", content: "." },
                finish_reason: null
              }
            ]
          }) + "\n\n"
        );
      }, 5e3);
      const timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        logger_default.warn(`\u89C6\u9891\u751F\u6210\u8D85\u65F6\uFF082\u5206\u949F\uFF09\uFF0C\u63D0\u793A\u7528\u6237\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B`);
        if (!stream.destroyed) {
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 1,
                  delta: {
                    role: "assistant",
                    content: "\n\n\u89C6\u9891\u751F\u6210\u65F6\u95F4\u8F83\u957F\uFF08\u5DF2\u7B49\u5F852\u5206\u949F\uFF09\uFF0C\u4F46\u89C6\u9891\u53EF\u80FD\u4ECD\u5728\u751F\u6210\u4E2D\u3002\n\n\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\uFF1A\n1. \u8BBF\u95EE https://jimeng.jianying.com/ai-tool/video/generate\n2. \u767B\u5F55\u540E\u67E5\u770B\u60A8\u7684\u521B\u4F5C\u5386\u53F2\n3. \u5982\u679C\u89C6\u9891\u5DF2\u751F\u6210\uFF0C\u60A8\u53EF\u4EE5\u76F4\u63A5\u5728\u5B98\u7F51\u4E0B\u8F7D\u6216\u5206\u4EAB\n\n\u60A8\u4E5F\u53EF\u4EE5\u7EE7\u7EED\u7B49\u5F85\uFF0C\u7CFB\u7EDF\u5C06\u5728\u540E\u53F0\u7EE7\u7EED\u5C1D\u8BD5\u83B7\u53D6\u89C6\u9891\uFF08\u6700\u957F\u7EA620\u5206\u949F\uFF09\u3002"
                  },
                  finish_reason: "stop"
                }
              ]
            }) + "\n\n"
          );
        }
      }, 2 * 60 * 1e3);
      stream.on("close", () => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        logger_default.debug("\u89C6\u9891\u751F\u6210\u6D41\u5DF2\u5173\u95ED\uFF0C\u5B9A\u65F6\u5668\u5DF2\u6E05\u7406");
      });
      logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u6A21\u578B: ${_model}, \u63D0\u793A\u8BCD: ${messages[messages.length - 1].content.substring(0, 50)}...`);
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content: "\n\n\u{1F3AC} \u89C6\u9891\u751F\u6210\u5DF2\u5F00\u59CB\uFF0C\u8FD9\u53EF\u80FD\u9700\u8981\u51E0\u5206\u949F\u65F6\u95F4..."
              },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      generateVideo(
        _model,
        messages[messages.length - 1].content,
        { width, height, resolution: "720p" },
        refreshToken
      ).then((videoUrl) => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
        if (!stream.destroyed && stream.writable) {
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 1,
                  delta: {
                    role: "assistant",
                    content: `

\u2705 \u89C6\u9891\u751F\u6210\u5B8C\u6210\uFF01

![video](${videoUrl})

\u60A8\u53EF\u4EE5\uFF1A
1. \u76F4\u63A5\u67E5\u770B\u4E0A\u65B9\u89C6\u9891
2. \u4F7F\u7528\u4EE5\u4E0B\u94FE\u63A5\u4E0B\u8F7D\u6216\u5206\u4EAB\uFF1A${videoUrl}`
                  },
                  finish_reason: null
                }
              ]
            }) + "\n\n"
          );
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 2,
                  delta: {
                    role: "assistant",
                    content: ""
                  },
                  finish_reason: "stop"
                }
              ]
            }) + "\n\n"
          );
          stream.end("data: [DONE]\n\n");
        } else {
          logger_default.debug("\u89C6\u9891\u751F\u6210\u5B8C\u6210\uFF0C\u4F46\u6D41\u5DF2\u5173\u95ED\uFF0C\u8DF3\u8FC7\u5199\u5165");
        }
      }).catch((err) => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        logger_default.error(`\u89C6\u9891\u751F\u6210\u5931\u8D25: ${err.message}`);
        logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${JSON.stringify(err)}`);
        let errorMessage = `\u26A0\uFE0F \u89C6\u9891\u751F\u6210\u8FC7\u7A0B\u4E2D\u9047\u5230\u95EE\u9898: ${err.message}`;
        if (err.message.includes("\u5386\u53F2\u8BB0\u5F55\u4E0D\u5B58\u5728")) {
          errorMessage += "\n\n\u53EF\u80FD\u539F\u56E0\uFF1A\n1. \u89C6\u9891\u751F\u6210\u8BF7\u6C42\u5DF2\u53D1\u9001\uFF0C\u4F46API\u65E0\u6CD5\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\n2. \u89C6\u9891\u751F\u6210\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\n3. \u5386\u53F2\u8BB0\u5F55ID\u65E0\u6548\u6216\u5DF2\u8FC7\u671F\n\n\u5EFA\u8BAE\u64CD\u4F5C\uFF1A\n1. \u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\u662F\u5426\u5DF2\u751F\u6210\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate\n2. \u5982\u679C\u5B98\u7F51\u5DF2\u663E\u793A\u89C6\u9891\uFF0C\u4F46\u8FD9\u91CC\u65E0\u6CD5\u83B7\u53D6\uFF0C\u53EF\u80FD\u662FAPI\u8FDE\u63A5\u95EE\u9898\n3. \u5982\u679C\u5B98\u7F51\u4E5F\u6CA1\u6709\u663E\u793A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u91CD\u65B0\u751F\u6210\u89C6\u9891";
        } else if (err.message.includes("\u83B7\u53D6\u89C6\u9891\u751F\u6210\u7ED3\u679C\u8D85\u65F6")) {
          errorMessage += "\n\n\u89C6\u9891\u751F\u6210\u53EF\u80FD\u4ECD\u5728\u8FDB\u884C\u4E2D\uFF0C\u4F46\u7B49\u5F85\u65F6\u95F4\u5DF2\u8D85\u8FC7\u7CFB\u7EDF\u8BBE\u5B9A\u7684\u9650\u5236\u3002\n\n\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate\n\n\u5982\u679C\u60A8\u5728\u5B98\u7F51\u4E0A\u770B\u5230\u89C6\u9891\u5DF2\u751F\u6210\uFF0C\u4F46\u8FD9\u91CC\u65E0\u6CD5\u663E\u793A\uFF0C\u53EF\u80FD\u662F\u56E0\u4E3A\uFF1A\n1. \u83B7\u53D6\u7ED3\u679C\u7684\u8FC7\u7A0B\u8D85\u65F6\n2. \u7F51\u7EDC\u8FDE\u63A5\u95EE\u9898\n3. API\u8BBF\u95EE\u9650\u5236";
        } else {
          errorMessage += "\n\n\u5982\u679C\u60A8\u5728\u5373\u68A6\u5B98\u7F51\u770B\u5230\u5DF2\u751F\u6210\u7684\u89C6\u9891\uFF0C\u53EF\u80FD\u662F\u83B7\u53D6\u7ED3\u679C\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\u3002\n\n\u8BF7\u8BBF\u95EE\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u521B\u4F5C\u5386\u53F2\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate";
        }
        if (err.historyId) {
          errorMessage += `

\u5386\u53F2\u8BB0\u5F55ID: ${err.historyId}\uFF08\u60A8\u53EF\u4EE5\u4F7F\u7528\u6B64ID\u5728\u5B98\u7F51\u641C\u7D22\u60A8\u7684\u89C6\u9891\uFF09`;
        }
        if (!stream.destroyed && stream.writable) {
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 1,
                  delta: {
                    role: "assistant",
                    content: `

${errorMessage}`
                  },
                  finish_reason: "stop"
                }
              ]
            }) + "\n\n"
          );
          stream.end("data: [DONE]\n\n");
        } else {
          logger_default.debug("\u89C6\u9891\u751F\u6210\u5931\u8D25\uFF0C\u4F46\u6D41\u5DF2\u5173\u95ED\uFF0C\u8DF3\u8FC7\u9519\u8BEF\u4FE1\u606F\u5199\u5165");
        }
      });
    } else {
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model || model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "\u{1F3A8} \u56FE\u50CF\u751F\u6210\u4E2D\uFF0C\u8BF7\u7A0D\u5019..." },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      generateImages(
        model,
        messages[messages.length - 1].content,
        { width, height },
        refreshToken
      ).then((imageUrls) => {
        if (!stream.destroyed && stream.writable) {
          for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            stream.write(
              "data: " + JSON.stringify({
                id: util_default.uuid(),
                model: _model || model,
                object: "chat.completion.chunk",
                choices: [
                  {
                    index: i + 1,
                    delta: {
                      role: "assistant",
                      content: `![image_${i}](${url})
`
                    },
                    finish_reason: i < imageUrls.length - 1 ? null : "stop"
                  }
                ]
              }) + "\n\n"
            );
          }
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model || model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: imageUrls.length + 1,
                  delta: {
                    role: "assistant",
                    content: "\u56FE\u50CF\u751F\u6210\u5B8C\u6210\uFF01"
                  },
                  finish_reason: "stop"
                }
              ]
            }) + "\n\n"
          );
          stream.end("data: [DONE]\n\n");
        } else {
          logger_default.debug("\u56FE\u50CF\u751F\u6210\u5B8C\u6210\uFF0C\u4F46\u6D41\u5DF2\u5173\u95ED\uFF0C\u8DF3\u8FC7\u5199\u5165");
        }
      }).catch((err) => {
        if (!stream.destroyed && stream.writable) {
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model || model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 1,
                  delta: {
                    role: "assistant",
                    content: `\u751F\u6210\u56FE\u7247\u5931\u8D25: ${err.message}`
                  },
                  finish_reason: "stop"
                }
              ]
            }) + "\n\n"
          );
          stream.end("data: [DONE]\n\n");
        } else {
          logger_default.debug("\u56FE\u50CF\u751F\u6210\u5931\u8D25\uFF0C\u4F46\u6D41\u5DF2\u5173\u95ED\uFF0C\u8DF3\u8FC7\u9519\u8BEF\u4FE1\u606F\u5199\u5165");
        }
      });
    }
    return stream;
  })().catch((err) => {
    if (retryCount < RETRY_CONFIG.MAX_RETRY_COUNT) {
      logger_default.error(`Response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_CONFIG.RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY));
        return createCompletionStream(
          messages,
          refreshToken,
          _model,
          retryCount + 1
        );
      })();
    }
    throw err;
  });
}

// src/api/routes/chat.ts
var chat_default = {
  prefix: "/v1/chat",
  post: {
    "/completions": async (request2) => {
      request2.validate("body.model", (v) => _15.isUndefined(v) || _15.isString(v)).validate("body.messages", _15.isArray).validate("headers.authorization", _15.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _15.sample(tokens);
      const { model, messages, stream } = request2.body;
      if (stream) {
        const stream2 = await createCompletionStream(messages, token, model);
        return new Response(stream2, {
          type: "text/event-stream"
        });
      } else
        return await createCompletion(messages, token, model);
    }
  }
};

// src/api/routes/ping.ts
var ping_default = {
  prefix: "/ping",
  get: {
    "": async () => "pong"
  }
};

// src/api/routes/token.ts
import _16 from "lodash";
var token_default = {
  prefix: "/token",
  post: {
    "/check": async (request2) => {
      request2.validate("body.token", _16.isString);
      const live = await getTokenLiveStatus(request2.body.token);
      return {
        live
      };
    },
    "/points": async (request2) => {
      request2.validate("headers.authorization", _16.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const points = await Promise.all(tokens.map(async (token) => {
        return {
          token,
          points: await getCredit(token)
        };
      }));
      return points;
    }
  }
};

// src/api/routes/models.ts
var models_default = {
  prefix: "/v1",
  get: {
    "/models": async () => {
      return {
        "data": [
          {
            "id": "jimeng",
            "object": "model",
            "owned_by": "jimeng-api"
          },
          {
            "id": "jimeng-video-3.0",
            "object": "model",
            "owned_by": "jimeng-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 3.0 \u7248\u672C"
          },
          {
            "id": "jimeng-video-3.0-pro",
            "object": "model",
            "owned_by": "jimeng-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 3.0 \u4E13\u4E1A\u7248"
          },
          {
            "id": "jimeng-video-2.0",
            "object": "model",
            "owned_by": "jimeng-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 2.0 \u7248\u672C"
          },
          {
            "id": "jimeng-video-2.0-pro",
            "object": "model",
            "owned_by": "jimeng-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 2.0 \u4E13\u4E1A\u7248"
          }
        ]
      };
    }
  }
};

// src/api/routes/videos.ts
import _17 from "lodash";
var videos_default = {
  prefix: "/v1/videos",
  post: {
    "/generations": async (request2) => {
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      request2.validate("body.model", (v) => _17.isUndefined(v) || _17.isString(v)).validate("body.prompt", _17.isString).validate("body.ratio", (v) => _17.isUndefined(v) || _17.isString(v)).validate("body.resolution", (v) => _17.isUndefined(v) || _17.isString(v)).validate("body.duration", (v) => {
        if (_17.isUndefined(v)) return true;
        if (isMultiPart && typeof v === "string") {
          const num = parseInt(v);
          return num === 5 || num === 10;
        }
        return _17.isFinite(v) && (v === 5 || v === 10);
      }).validate("body.file_paths", (v) => _17.isUndefined(v) || _17.isArray(v)).validate("body.filePaths", (v) => _17.isUndefined(v) || _17.isArray(v)).validate("body.response_format", (v) => _17.isUndefined(v) || _17.isString(v)).validate("headers.authorization", _17.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _17.sample(tokens);
      const {
        model = DEFAULT_MODEL2,
        prompt,
        ratio = "1:1",
        resolution = "720p",
        duration = 5,
        file_paths = [],
        filePaths = [],
        response_format = "url"
      } = request2.body;
      const finalDuration = isMultiPart && typeof duration === "string" ? parseInt(duration) : duration;
      const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;
      const videoUrl = await generateVideo(
        model,
        prompt,
        {
          ratio,
          resolution,
          duration: finalDuration,
          filePaths: finalFilePaths,
          files: request2.files
          // 传递上传的文件
        },
        token
      );
      if (response_format === "b64_json") {
        const videoBase64 = await util_default.fetchFileBASE64(videoUrl);
        return {
          created: util_default.unixTimestamp(),
          data: [{
            b64_json: videoBase64,
            revised_prompt: prompt
          }]
        };
      } else {
        return {
          created: util_default.unixTimestamp(),
          data: [{
            url: videoUrl,
            revised_prompt: prompt
          }]
        };
      }
    }
  }
};

// src/api/routes/index.ts
var routes_default = [
  {
    get: {
      "/": async () => {
        return {
          service: "jimeng-api",
          status: "running",
          version: "1.6.3",
          description: "\u514D\u8D39\u7684AI\u56FE\u50CF\u548C\u89C6\u9891\u751F\u6210API\u670D\u52A1 - \u57FA\u4E8E\u5373\u68A6AI\u7684\u9006\u5411\u5DE5\u7A0B\u5B9E\u73B0",
          documentation: "https://github.com/iptag/jimeng-api",
          endpoints: {
            images: "/v1/images/generations",
            compositions: "/v1/images/compositions",
            videos: "/v1/videos/generations",
            chat: "/v1/chat/completions",
            models: "/v1/models",
            health: "/ping"
          }
        };
      }
    }
  },
  images_default,
  chat_default,
  ping_default,
  token_default,
  models_default,
  videos_default
];

// src/index.ts
var startupTime = performance.now();
(async () => {
  logger_default.header();
  logger_default.info("<<<< jimeng-api >>>>");
  logger_default.info("Version:", environment_default.package.version);
  logger_default.info("Process id:", process.pid);
  logger_default.info("Environment:", environment_default.env);
  logger_default.info("Service name:", config_default.service.name);
  server_default.attachRoutes(routes_default);
  await server_default.listen();
  config_default.service.bindAddress && logger_default.success("Service bind address:", config_default.service.bindAddress);
})().then(
  () => logger_default.success(
    `Service startup completed (${Math.floor(performance.now() - startupTime)}ms)`
  )
).catch((err) => console.error(err));
//# sourceMappingURL=index.js.map