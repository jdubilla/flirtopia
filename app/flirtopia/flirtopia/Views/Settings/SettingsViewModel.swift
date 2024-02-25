//
//  SettingsViewModel.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import Foundation

class SettingsViewModel: ObservableObject {
    
    @Published var username: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    
    init() {
        Task {
            
        }
    }
    
    
    
}
