/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
"use strict";

import * as path from "path";
import * as shell from "shelljs";
import * as vscode from "vscode";
import { configuration } from "./configuration";

import { workspace, Disposable, ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  RevealOutputChannelOn,
  SettingMonitor,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";
import { platform } from "os";

export function activate(context: ExtensionContext) {
  if (!shell.which("elixir")) {
    vscode.window.showErrorMessage(
      "'elixir' command not found in path. Ensure Elixir is installed and available in path"
    );
    return null;
  }

  const command =
    platform() == "win32" ? "language_server.bat" : "language_server.sh";

  const serverOpts = {
    command: context.asAbsolutePath("./elixir-ls-release/" + command)
  };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run: serverOpts,
    debug: serverOpts
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for Elixir documents
    documentSelector: [
      { language: "elixir", scheme: "file" },
      { language: "elixir", scheme: "untitled" }
    ],
    // Don't focus the Output pane on errors because request handler errors are no big deal
    revealOutputChannelOn: RevealOutputChannelOn.Never,
    synchronize: {
      // Synchronize the setting section 'elixirLS' to the server
      configurationSection: "elixirLS",
      // Notify the server about file changes to Elixir files contained in the workspace
      fileEvents: [
        workspace.createFileSystemWatcher("**/*.{ex,exs,erl,yrl,xrl,eex}")
      ]
    }
  };

  // Create the language client and start the client.
  let disposable = new LanguageClient(
    "ElixirLS",
    "ElixirLS",
    serverOptions,
    clientOptions
  ).start();

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.languages.setLanguageConfiguration("elixir", configuration)
  );
}
