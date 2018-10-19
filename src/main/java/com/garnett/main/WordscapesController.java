package com.garnett.main;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.garnett.utilities.GameProperties;

@RestController
public class WordscapesController {

	
	final static Logger LOG = Logger.getLogger(Controller.class);
	private GameProperties props = GameProperties.getInstance();
	private List<String> words;
	
	public WordscapesController() {
		
		String fileName = "cfg/words_alpha.txt";
		words = new ArrayList<>();

		try (BufferedReader br = Files.newBufferedReader(Paths.get(fileName))) {
			words = br.lines().collect(Collectors.toList());
		} catch (IOException e) {
			LOG.error("Error reading file", e);
		}
	
		LOG.info("Loaded in list of " + words.size() + " words");
	}


	@RequestMapping(value="/words/{containing}", method=RequestMethod.GET)
	public List<String> words(@PathVariable("containing") String containing, @RequestParam int minWord) {
		
		List<String> lessWords = new ArrayList<>();
		
		LOG.info("Checking " + words.size() + " words for " + containing);
		
		List<String> filteredWords = words.parallelStream().filter(word -> (word.length() <= containing.length() && word.length() >= minWord)).collect(Collectors.toList());
		
		LOG.info("Only " + filteredWords.size() + " words are between " + containing.length() + " and " + minWord + " characters.");
		
		
		filteredWords.forEach(word -> {
				String workingWord = word;
				
				for (char c: containing.toCharArray()) {
					if (isCharInWord(workingWord, c))
						workingWord = removeCharFromWord(workingWord, c);
				}
				
				if (workingWord.length() == 0)
					lessWords.add(word);
			
		});
		
		return lessWords;
	}
	
	private boolean isCharInWord(String word, char c) {
		return word.contains(c + "");
	}
	
	private String removeCharFromWord(String word, char c) {
		return word.replaceFirst(c+"", "");
	}
	
	@RequestMapping(value="/allwords", method=RequestMethod.GET)
	public List<String> allwords() {
		
		return words;
	}
}
