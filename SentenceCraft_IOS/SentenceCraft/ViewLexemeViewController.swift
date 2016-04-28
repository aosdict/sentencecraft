//
//  ViewLexemeViewController.swift
//  SentenceCraft
//
//  Created by Tausif Ahmed on 4/11/16.
//  Copyright © 2016 SentenceCraft. All rights reserved.
//

import UIKit

class ViewLexemeViewController: UIViewController {
	
	
	private var tagsInfo: UILabel = UILabel()
	private var lexemeText: UILabel = UILabel()
	
	func addData(tags: String, lexeme: String) {
		tagsInfo = UILabel.init(frame: CGRectMake(0, 0, self.view.frame.width, 50))
		tagsInfo.text = "Tags: \(tags)"
		tagsInfo.numberOfLines = 0
		tagsInfo.lineBreakMode = NSLineBreakMode.ByWordWrapping
		tagsInfo.font = UIFont(name: tagsInfo.font.fontName, size: 25)
		tagsInfo.center = CGPointMake(tagsInfo.center.x, tagsInfo.frame.width/3)
		tagsInfo.textAlignment = NSTextAlignment.Center
		self.view.addSubview(tagsInfo)

		lexemeText = UILabel.init(frame: CGRectMake(0, 0, self.view.frame.width, 150))
		lexemeText.text = "Lexeme: \n\(lexeme)"
		lexemeText.numberOfLines = 0
		lexemeText.lineBreakMode = NSLineBreakMode.ByWordWrapping
		lexemeText.font = UIFont(name: tagsInfo.font.fontName, size: 25)
		lexemeText.center = CGPointMake(lexemeText.center.x, tagsInfo.center.y + 2*tagsInfo.frame.height)
		lexemeText.numberOfLines = 4
		lexemeText.textAlignment = NSTextAlignment.Center
		self.view.addSubview(lexemeText)

		
	}

	override func viewDidLoad() {
		super.viewDidLoad()
//		createLexemeInfo()
		// Do any additional setup after loading the view, typically from a nib.
	}
	
	override func didReceiveMemoryWarning() {
		super.didReceiveMemoryWarning()
		// Dispose of any resources that can be recreated.
	}
}
