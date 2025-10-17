import { NextRequest, NextResponse } from "next/server";
import { handleWalletPrepareCalls } from "./methods/wallet_prepareCalls";
import { handleWalletSendPreparedCalls } from "./methods/wallet_sendPreparedCalls";
// JSON-RPC request structure
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
  id?: string | number | null;
}

// JSON-RPC response structure
interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: string | number | null;
}

// JSON-RPC error codes
const JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: "Parse error" },
  INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
  METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
  INVALID_PARAMS: { code: -32602, message: "Invalid params" },
  INTERNAL_ERROR: { code: -32603, message: "Internal error" },
};

export async function POST(request: NextRequest) {
  let body: JsonRpcRequest;

  try {
    // Parse request body
    body = await request.json();
  } catch (error) {
    // Handle JSON parsing errors
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: {
        ...JSON_RPC_ERRORS.PARSE_ERROR,
        data: error instanceof Error ? error.message : "Unknown error",
      },
      id: null,
    };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    // Validate JSON-RPC format
    if (body.jsonrpc !== "2.0") {
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        error: JSON_RPC_ERRORS.INVALID_REQUEST,
        id: body.id ?? null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!body.method || typeof body.method !== "string") {
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        error: JSON_RPC_ERRORS.INVALID_REQUEST,
        id: body.id ?? null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    let result: unknown;

    // Switch on method to call appropriate handler
    try {
      switch (body.method) {
        case "wallet_prepareCalls":
          result = await handleWalletPrepareCalls(body.params);
          break;

        case "wallet_sendPreparedCalls":
          result = await handleWalletSendPreparedCalls(body.params);
          break;

        default:
          const errorResponse: JsonRpcResponse = {
            jsonrpc: "2.0",
            error: {
              ...JSON_RPC_ERRORS.METHOD_NOT_FOUND,
              data: { method: body.method },
            },
            id: body.id ?? null,
          };
          return NextResponse.json(errorResponse, { status: 404 });
      }
    } catch (error) {
      // Handle parameter validation errors from method handlers
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        error: {
          ...JSON_RPC_ERRORS.INVALID_PARAMS,
          data: error instanceof Error ? error.message : "Unknown error",
        },
        id: body.id ?? null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Return successful response
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      result,
      id: body.id ?? null,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle any other unexpected errors
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: {
        ...JSON_RPC_ERRORS.INTERNAL_ERROR,
        data: error instanceof Error ? error.message : "Unknown error",
      },
      id: body.id ?? null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
