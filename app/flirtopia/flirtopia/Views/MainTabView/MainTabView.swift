//
//  MainTabView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct MainTabView: View {
    
    @StateObject var vm = MainTabViewModel()
    
    var body: some View {
        TabView(selection: $vm.selection) {
            SuggestionsView()
                .tabItem {
                    Text("Suggestions")
                    Image(systemName: "magnifyingglass.circle.fill")
                }
                .tag(0)
            Text("Chat")
                .tabItem {
                    Text("Chat")
                    Image(systemName: "message")
                }
                .tag(1)
            Text("Likes")
                .tabItem {
                    Text("Likes")
                    Image(systemName: "hand.thumbsup")
                }
                .tag(2)
            Text("History")
                .tabItem {
                    Text("History")
                    Image(systemName: "clock")
                }
                .tag(3)
            SettingsView()
                .tabItem {
                    Text("Settings")
                    Image(systemName: "gearshape.fill")
                }
                .tag(4)
        }
    }
}

#Preview {
    MainTabView()
}
