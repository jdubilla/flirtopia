//
//  Keychain.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import Foundation
import Security

class KeychainManager {
    
    func saveTokenToKeychain(token: String) {
        if let tokenData = token.data(using: .utf8) {
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrAccount as String: "flirtopia",
                kSecValueData as String: tokenData
            ]

            SecItemDelete(query as CFDictionary)

            let status = SecItemAdd(query as CFDictionary, nil)
            if status != errSecSuccess {
                print("Error saving to keychain")
            }
        }
    }
    
    func getTokenFromKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "flirtopia",
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var tokenData: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &tokenData)

        if status == errSecSuccess {
            if let retrievedData = tokenData as? Data,
                let retrievedToken = String(data: retrievedData, encoding: .utf8) {
                print("Token retrieved from keychain: \(retrievedToken)")
                return retrievedToken
            }
        } else {
            print("Error retrieving from keychain")
        }
        return nil
    }
}
