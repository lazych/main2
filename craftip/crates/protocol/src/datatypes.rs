// SPDX-FileCopyrightText: 2026 Jurek <copyright@jurek.io>
// SPDX-License-Identifier: AGPL-3.0-only

use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum PacketError {
    #[error("Packet is not valid")]
    NotValid,
    #[error("String encoding is not valid")]
    NotValidStringEncoding,
    #[error("Not a valid first packet")]
    NotValidFirstPacket,
    #[error("Packet is not matching to decoder, do not recognize packet")]
    NotMatching,
    #[error("There has been an error during encoding")]
    EncodingError,
    #[error("Packet too long")]
    TooLong,
}
