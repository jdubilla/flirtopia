//
//  SettingsView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct SettingsView: View {
    
    @StateObject var vm = SettingsViewModel()
    
    var body: some View {
        VStack {
            Form {
                Section("General informations") {
                    
                }
            }
        }
    }
}

#Preview {
    SettingsView()
}
