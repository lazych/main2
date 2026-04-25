// SPDX-FileCopyrightText: 2026 Jurek <copyright@jurek.io>
// SPDX-License-Identifier: AGPL-3.0-only

/// creates an error string with the file and line number
#[macro_export]
macro_rules! server_error {
    ($($arg:tt)*) => ({
        |e| {
            use crate::error::AppError;
            AppError::ServerError(format!("{}:{} {}: {e}", file!(), line!(), format_args!($($arg)*)))
        }
    })
}
